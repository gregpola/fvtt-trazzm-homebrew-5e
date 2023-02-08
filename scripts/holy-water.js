const version = "10.0.0";
const optionName = "Holy Water";

try {
	if (args[0].macroPass === "postActiveEffects") {
		const lastArg = args[args.length - 1];
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		const actorToken = canvas.tokens.get(lastArg.tokenId);
		
		if (lastArg.hitTargets.length > 0) {
			const targetActor = lastArg.hitTargets[0].actor;
			const targetToken = game.canvas.tokens.get(lastArg.hitTargets[0].id);
			
			const ctype = targetActor.system.details?.type?.value;
			if (ctype && ["undead", "fiend"].includes(ctype.toLowerCase())) {
				let damageRoll = new Roll(`2d6`).roll({async:false});
				game.dice3d?.showForRoll(damageRoll);
				new MidiQOL.DamageOnlyWorkflow(actor, actorToken, damageRoll.total, "radiant", [targetToken], damageRoll, {flavor: `(Radiant)`, 
					itemCardId: lastArg.itemCardId, useOther: false});
			}
		}
	}
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
