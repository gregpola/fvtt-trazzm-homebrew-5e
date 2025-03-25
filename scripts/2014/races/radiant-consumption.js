/*
	Searing light temporarily radiates from your eyes and mouth. For the duration, you shed bright light in a 10-foot
	radius and dim light for an additional 10 feet, and at the end of each of your turns, each creature within 10 feet
	of you takes radiant damage equal to your proficiency bonus. Until the transformation ends, once on each of your
	turns, you can deal extra radiant damage to one target when you deal damage to it with an attack or a spell. The
	extra damage equals your proficiency bonus.
 */
const version = "12.3.0";
const optionName = "Radiant Consumption";
const timeFlag = "radiantConsumptionTime";

try {
	if (args[0].macroPass === "DamageBonus") {
		// Check for availability i.e. once per actors turn
		if (!HomebrewHelpers.isAvailableThisTurn(actor, timeFlag) || !game.combat) {
			console.log(`${optionName}: is not available for this damage`);
			return {};
		}

		// make sure it is the actor's turn
		const actorTurn = game.combat.turns.findIndex(t => t.tokenId === token.id);
		const currentTurn = game.combat.turn;
		if (actorTurn !== currentTurn) {
			console.log(`${optionName}: is not available, not the actors turn`);
			return {};
		}

		// make sure it's a damaging item
		if (["healing", "temphp"].includes(workflow.defaultDamageType)) {
			console.log(`${optionName}: not for healing damage`);
			return {};
		}

		let useFeature = false;
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `${optionName}`,
				content: `<p>Apply ${optionName} damage to this attack?</p>`,
				buttons: {
					one: {
						icon: '<p> </p><img src = "icons/magic/light/explosion-star-glow-silhouette.webp" width="50" height="50"></>',
						label: "<p>Yes</p>",
						callback: () => resolve(true)
					},
					two: {
						icon: '<p> </p><img src = "icons/skills/melee/weapons-crossed-swords-yellow.webp" width="50" height="50"></>',
						label: "<p>No</p>",
						callback: () => { resolve(false) }
					}
				},
				default: "two"
			}).render(true);
		});

		useFeature = await dialog;
		if (!useFeature) {
			console.log(`${optionName}: player chose to skip this turn`);
			return {};
		}

		await HomebrewHelpers.setUsedThisTurn(actor, timeFlag);
		const pb = actor.system.attributes.prof ?? 2;
		return {damageRoll: `${pb}[radiant]`, flavor: `${optionName} Damage`};
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

/*
// Effect Macro on turn end
// do radiant damage to everyone around the actor
const targets = MidiQOL.findNearby(null, token, 10);
const rollTerm = actor.system.attributes.prof;
let damageRoll = await new Roll(`${rollTerm}`).evaluate();
await game.dice3d?.showForRoll(damageRoll);
await new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "radiant", targets, damageRoll, {flavor: 'Radiant Consumption', itemCardId: "new"});
*/
