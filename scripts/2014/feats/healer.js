/**
 * You are an able physician, allowing you to mend wounds quickly and get your allies back in the fight. You gain the
 * following benefits:
 *
 * 		- When you use a healer's kit to stabilize a dying creature, that creature also regains 1 hit point.
 * 		- As an action, you can spend one use of a healer's kit to tend to a creature and restore 1d6 + 4 hit points to
 * 		it, plus additional hit points equal to the creature's maximum number of Hit Dice. The creature can't regain hit
 * 		points from this feat again until it finishes a short or long rest.
 */
const version = "12.3.0";
const optionName = "Healer";
const appliedEffectName = "Healed by Healer's Kit";

try {
	if (args[0].macroPass === "postActiveEffects") {
		const targetToken = workflow.targets.first();

		// check if eligible
		let healedEffect = HomebrewHelpers.findEffect(targetToken.actor, appliedEffectName, workflow.item.uud);
		if (healedEffect) {
			return ui.notifications.error(`${optionName}: target has recently benefited from this feat`);
		}

		let level = HomebrewHelpers.getLevelOrCR(targetToken.actor);
		let healersKit = actor.items.find(i => i.name === "Healer's Kit");

		if (healersKit) {
			const damageRoll = await new Roll(`1d6 + 4 + ${level}`).evaluate();
			await new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "healing", [targetToken], damageRoll,
				{flavor: `${optionName}`, itemCardId: args[0].itemCardId});

			const usesRemaining = healersKit.system.uses.value - 1;
			await healersKit.update({ "system.uses.value": usesRemaining });


			let effectData = {
				name: appliedEffectName,
				icon: item.img,
				changes: [
				],
				flags: {
					dae: {
						specialDuration: ['shortRest', 'longRest']
					}
				},
				disabled: false
			};
			await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: targetToken.actor.uuid, effects: [effectData]});
		}
	}
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
