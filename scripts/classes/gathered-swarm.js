/*
	A swarm of intangible nature spirits has bonded itself to you and can assist you in battle. While you’re alive, the
	swarm remains in your space, crawling on you or flying and skittering around you within your space. You determine
	its appearance, or you generate its appearance by rolling on the Swarm Appearance table.

	Once on each of your turns, you can cause the swarm to assist you in one of the following ways, immediately after
	you hit a creature with an attack:

		* The attack’s target takes 1d6 piercing damage from the swarm.
		* The attack’s target must succeed on a Strength saving throw against your spell save DC or be moved by the swarm up to 15 feet horizontally in a direction of your choice. 
		* You are moved by the swarm 5 feet horizontally in a direction of your choice.
*/
const version = "12.3.3";
const optionName = "Gathered Swarm";
const timeFlag = "gathered-swarm-time";

try {
	if (args[0].tag === "OnUse" && args[0].macroPass === "postAttackRoll") {
		const targetToken = workflow.hitTargets.first();

		if (targetToken) {
			// Skip if the action isn't an weapon attack roll
			if (!["mwak", "rwak", "msak", "rsak"].includes(workflow.item.system.actionType)) {
				console.log(`${optionName} - action type isn't applicable`);
				return {};
			}

			// check once per turn
			if (HomebrewHelpers.isAvailableThisTurn(actor, timeFlag) && game.combat) {
				// ask if they want to use the feature
				const content = `
				<p>Use a swarm option on this attack?</p>
				<label style="margin-bottom: 10px;"><input style="right: 10px;" type="radio" name="choice" value="skip" checked />Skip this attack</label>
				<label style="margin-bottom: 10px;"><input style="right: 10px;" type="radio" name="choice" value="damage"/>Extra 1d6 piercing damage</label>
				<label style="margin-bottom: 10px;"><input style="right: 10px;" type="radio" name="choice" value="moveTarget"/>Attempt to move your target</label>
				<label style="margin-bottom: 10px;"><input style="right: 10px;" type="radio" name="choice" value="moveSelf"/>Move 5 feet in the direction of your choice</label>`;

				let featureOption = await foundry.applications.api.DialogV2.prompt({
					content: content,
					rejectClose: false,
					ok: {
						callback: (event, button, dialog) => {
							return button.form.elements.choice.value;
						}
					},
					window: {
						title: `${optionName}`,
					},
					position: {
						width: 400
					}
				});

				if (featureOption && (featureOption !== 'skip')) {
					await HomebrewHelpers.setUsedThisTurn(actor, timeFlag);
					let mightySwarm = actor.items.getName("Mighty Swarm");

					switch (featureOption) {
						// extra damage
						case 'damage':
							const die = mightySwarm ? '1d8' : '1d6';
							await applyDamageBonus(actor, die);
							break;

						// move target
						case 'moveTarget':
							const dc = actor.system.attributes.spelldc;
							const flavor = `${CONFIG.DND5E.abilities["str"].label} DC${dc} ${optionName}`;
							let saveRoll = await targetToken.actor.rollAbilitySave("str", {flavor: flavor, damageType: "push"});
							await game.dice3d?.showForRoll(saveRoll);
							if (saveRoll.total < dc) {
								await new Portal()
									.color("#ff0000")
									.texture("icons/svg/target.svg")
									.origin(targetToken)
									.range(15)
									.teleport();

								if (mightySwarm) {
									await HomebrewEffects.applyProneEffect(targetToken.actor, item.uuid);
								}
							}
							break;

						// move yourself
						case 'moveSelf':
							await HomebrewMacros.teleportToken(token, 5);

							if (mightySwarm) {
								let hasCover = actor.getRollData().effects.find(eff => eff.name.startsWith('Cover '));
								if (!hasCover) {
									await HomebrewEffects.applyHalfCoverEffect(actor, ['turnStart']);
								}
							}
							break;
					}
				}
			}
		}
	}
	
} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}

async function applyDamageBonus(actor, die) {
	const effectData = {
		name: `${optionName} damage bonus`,
		icon: "icons/creatures/invertebrates/dragonfly-teal.webp",
		origin: actor.uuid,
		transfer: false,
		disabled: false,
		duration: {rounds: 1},
		flags: { dae: { specialDuration: ["DamageDealt"] } },
		changes: [
			{
				key: 'system.bonuses.weapon.damage',
				mode: CONST.ACTIVE_EFFECT_MODES.ADD,
				value: `${die}[piercing]`,
				priority: 20
			}
		]
	}

	return await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effectData] });
}
