/*
	This poison is typically made only by the drow, and only in a place far removed from sunlight. A creature subjected
	to this poison must succeed on a DC 13 Constitution saving throw or be Poisoned for 1 hour. If the saving throw fails
	by 5 or more, the creature is also Unconscious while poisoned in this way. The creature wakes up if it takes damage
	or if another creature takes an action to shake it awake.
*/
const version = "12.3.0";
const optionName = "Drow Poison";
const flagName = "drow-poison-weapon";
const saveDC = 13;
const saveFlavor = `${CONFIG.DND5E.abilities["con"].label} DC${saveDC} ${optionName}`;

try {
	if (args[0].macroPass === "preItemRoll") {
		// find the actor's items that can be poisoned
		// must be piercing or slashing
		let weapons = actor.items.filter(i => i.type === `weapon` && (i.system.damage.parts[0][1] === `piercing` || i.system.damage.parts[0][1] === `slashing`));
		if (!weapons || weapons.length < 1) {
			ui.notifications.error(`${optionName} - no appropriate weapons available`);
			return false;
		}
	}
	else if (args[0].macroPass === "postActiveEffects") {
		await HomebrewMacros.applyPoisonToWeapon(actor, item);
	}
	else if (args[0].macroPass === "DamageBonus") {
		const targetToken = workflow.hitTargets.first();
		if (targetToken) {
			// poison only lasts one hit for most weapons, three for ammo
			let flag = actor.getFlag(_flagGroup, _poisonedWeaponFlag);
			if (flag && workflow.item._id === flag.itemId) {
				let apps = flag.applications;
				const itemName = flag.itemName;
				const itemId = flag.itemId;

				// check for expiration condition
				if (apps > 0) {
					apps -= 1;
					await actor.setFlag(_flagGroup, _poisonedWeaponFlag, {
						itemName: itemName,
						itemId: itemId,
						applications: apps
					});

					if (apps === 0) {
						await HomebrewMacros.removePoisonFromWeapon(actor);
						let effect = actor.effects.find(ef => ef.name === optionName);
						if (effect) {
							await MidiQOL.socket().executeAsGM("removeEffects", {
								actorUuid: actor.uuid,
								effects: [effect.id]
							});
						}
					}

					// request the saving throw
					let saveRoll = await targetToken.actor.rollAbilitySave("con", {
						flavor: saveFlavor,
						damageType: "poison"
					});
					if (saveRoll.total < saveDC) {
						// hasStatusEffect
						const hasEffectApplied = await game.dfreds.effectInterface.hasEffectApplied({
							effectName: 'Poisoned',
							uuid: targetToken.actor.uuid
						});
						if (!hasEffectApplied) {
							await game.dfreds.effectInterface.addEffect({
								effectName: 'Poisoned',
								uuid: targetToken.actor.uuid
							});
						}

						if (saveRoll.total <= (saveDC - 5)) {
							if (!targetToken.actor.hasConditionEffect("sleeping")) {
							//if (!targetToken.hasStatusEffect("sleeping")) {
								await targetToken.actor.toggleStatusEffect("sleeping", {active: true});
							}
						}
					}
				}
			}
		}
	}
	else if (args[0] === "off") {
		await HomebrewMacros.removePoisonFromWeapon(actor);
	}

} catch (err) {
	console.error(`${optionName} - ${version}`, err);
}
