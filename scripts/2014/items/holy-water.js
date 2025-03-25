const version = "11.0";
const optionName = "Holy Water";

try {
	if (args[0].macroPass === "postActiveEffects") {
		const targetToken = workflow.hitTargets.first();
		if (targetToken) {
			const ctype = targetToken.actor.system.details?.type?.value;
			if (ctype && ["undead", "fiend"].includes(ctype.toLowerCase())) {
				let damageRoll = new Roll(`2d6`).roll({async:false});
				game.dice3d?.showForRoll(damageRoll);
				new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "radiant", [targetToken], damageRoll, {flavor: `(Radiant)`,
					itemCardId: workflow.itemCardId, useOther: false});
			}
		}
	}
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
