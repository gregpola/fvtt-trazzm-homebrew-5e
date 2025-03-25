/*
	If you make an attack roll for a spell and miss, you can spend 2 sorcery points to reroll the d20, and you must use the new roll.

	You can use Seeking Spell even if you have already used a different Metamagic option during the casting of the spell.
*/
const version = "12.3.0";
const optionName = "Seeking Spell";
const cost = 2;

try {
	if (args[0].tag === "OnUse" && args[0].macroPass === "preCheckHits" && item.type === "spell") {
		// skip if it hits
		let attackTotal = workflow.attackTotal;
		if (Array.from(workflow.targets).every(i => i.actor?.system.attributes.ac.value <= attackTotal)) return;

		let usesLeft = HomebrewHelpers.getAvailableSorceryPoints(actor);
		if (usesLeft && (usesLeft >= cost)) {
			// ask if they want to use it
			let useFeature = await foundry.applications.api.DialogV2.confirm({
				window: {
					title: `${optionName}`,
				},
				content: `<p>Use ${optionName} on this attack? [${workflow.diceRoll} rolled]</p><sub>(costs ${cost} sorcery points to reroll the attack)</sub>`,
				rejectClose: false,
				modal: true
			});

			if (useFeature) {
				let newAttackRoll = await new Roll(workflow.attackRoll.formula, workflow.attackRoll.data, workflow.attackRoll.options).evaluate();
				await game.dice3d?.showForRoll(newAttackRoll);
				await workflow.setAttackRoll(newAttackRoll);
				await HomebrewHelpers.reduceAvailableSorceryPoints(actor, cost)
			}
		}
	}
	
} catch (err)  {
    console.error(`${optionName}: ${version}`, err);
}
