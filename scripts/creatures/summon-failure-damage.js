const version = "12.3.0";
const optionName = "Summon Failure Damage";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const failureFLagName = "summon-failed";
try {
	if (args[0].macroPass === "postActiveEffects") {
		let flag = actor.getFlag(_flagGroup, failureFLagName);
		if (flag) {
			await actor.unsetFlag(_flagGroup, failureFLagName);
			const failureDamage = workflow.otherDamageFormula;
			if (failureDamage) {
				const damageRoll = await new Roll(`${failureDamage}`).evaluate();
				await game.dice3d?.showForRoll(damageRoll);
				await new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "psychic", [token], damageRoll,
					{ flavor: `${optionName} failure damage`, itemData: item, itemCardId: "new" });
			}
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
