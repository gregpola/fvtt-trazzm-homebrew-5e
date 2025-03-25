const version = "11.0";
const optionName = "Melf's Acid Arrow";

try {
	if (args[0].macroPass === "postAttackRoll") {
		// apply partial damage on miss
		if (workflow.hitTargets.size === 0) {
			let target = workflow.targets.first();
			const actorData = actor.getRollData();
			const spellLevel = workflow.castData.castLevel;

			let damageRoll = await new game.dnd5e.dice.DamageRoll(`${spellLevel}d4[acid]`, actorData).evaluate({async:false});
			await new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "acid", [target], damageRoll, { flavor: `(${optionName})`, itemData: item, itemCardId: "new" });
			await game.dice3d?.showForRoll(damageRoll);			
		}
	}
	
} catch (err) {
    console.error(`${optionName}:  ${version}`, err);
}
