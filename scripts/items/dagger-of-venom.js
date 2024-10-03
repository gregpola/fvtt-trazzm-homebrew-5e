/*
	You can use an action to cause thick, black poison to coat the blade. The poison remains for 1 minute or until an
	attack using this weapon hits a creature. That creature must succeed on a DC 15 Constitution saving throw or take
	2d10 poison damage and become Poisoned for 1 minute.

	* The dagger can't be used this way again until the next dawn. *
 */
const version = "12.3.0";
const optionName = "Dagger of Venom";
const flagName = "dagger-of-venom";
const damageDice = "2d10";
const saveDC = 15;
const saveFlavor = `${CONFIG.DND5E.abilities["con"].label} DC${saveDC} ${optionName}`;

// for tracking once per day
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const coatingEffectName = "Dagger of Venom (last coating)";

try {
	if (args[0].macroPass === "preItemRoll") {
		const target = workflow.targets.first();
		if (target === token) {
			// is coating available?
			let coatingEffect = actor.effects.find(ef => ef.name === coatingEffectName);
			if (coatingEffect) {
				console.error(`${optionName} - can't apply poison, already used this day`);
			}
			else {
				// ask if they want to coat the blade
				let dialog = new Promise((resolve, reject) => {
					new Dialog({
						// localize this text
						title: `${optionName}`,
						content: `<p>Do you want to coat the blade with venom?</p>`,
						buttons: {
							one: {
								icon: '<i class="fas fa-check"></i>',
								label: "Yes",
								callback: () => resolve(true)
							},
							two: {
								icon: '<i class="fas fa-times"></i>',
								label: "No",
								callback: () => {resolve(false)}
							}
						},
						default: "two"
					}).render(true)
				});

				let coatTheBlade = await dialog;
				if (coatTheBlade) {
					let effectData = [{
						name: coatingEffectName,
						icon: item.img,
						origin: item.uuid,
						transfer: false,
						disabled: false,
						flags: { dae: { specialDuration: ["longRest"] } },
						changes: []
					}];
					await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: effectData });

					// mutate the dagger
					const itemName = item.name;
					let mutations = {
						"name": `${item.name} (coated)`
					};

					// Update the weapon name to show it as poisoned
					await item.update(mutations);
					await actor.setFlag(_flagGroup, flagName, {itemName: itemName, itemId: item.id });
					ChatMessage.create({content: itemName + " is coated with poison"});
				}
			}

			return false; // don't proceed to attack self
		}
	}
	else if (args[0].macroPass === "DamageBonus") {
		const targetToken = workflow.hitTargets.first();
		if (targetToken) {
			// poison only lasts one hit
			let flag = actor.getFlag(_flagGroup, flagName);
			if (flag && workflow.item._id === flag.itemId) {
				const itemName = flag.itemName;

				let weapon = actor.items.get(flag.itemId);
				if (weapon) {
					await weapon.update({"name" : flag.itemName});
					ChatMessage.create({content: itemName + " returns to normal", speaker: ChatMessage.getSpeaker({actor: actor})});
				}
				await actor.unsetFlag(_flagGroup, flagName);

				// request the saving throw
				const saveRoll = await targetToken.actor.rollAbilitySave("con", {flavor: saveFlavor, damageType: "poison"});
				if (saveRoll.total < saveDC) {
					await applyPoisonedEffect(actor, targetToken.actor);
					return { damageRoll: `${damageDice}[poison]`, flavor: optionName };
				}
				else {
					return { damageRoll: `${damageDice}/2[poison]`, flavor: optionName };
				}
			}
		}
	}
	
} catch (err) {
	console.error(`${optionName} - ${version}`, err);
}

async function applyPoisonedEffect(actor, targetActor) {
    let effectData = [{
        name: optionName,
        icon: 'icons/consumables/potions/potion-jar-corked-labeled-poison-skull-green.webp',
        origin: actor.uuid,
        transfer: false,
        disabled: false,
		duration: {startTime: game.time.worldTime, seconds: 60},
        changes: [
            { key: `macro.CE`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: "Poisoned", priority: 20 }
        ]
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetActor.uuid, effects: effectData });
}
