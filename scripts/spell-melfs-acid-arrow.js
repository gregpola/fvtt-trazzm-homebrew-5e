const version = "10.0.0";
const optionName = "Melf's Acid Arrow";
const lastArg = args[args.length - 1];

try {
	if (args[0].macroPass === "postAttackRoll") {
		// apply partial damage if miss
		if (lastArg.hitTargets.length === 0) {
			let tactor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
			const actorData = tactor.getRollData();
			const tokenD = canvas.tokens.get(lastArg.tokenId);
			const itemD = lastArg.item;
			let target = await fromUuid(args[0].targetUuids[0] ?? "");

			const spellLevel = lastArg.workflow.castData.castLevel;
			let damageRoll = await new game.dnd5e.dice.DamageRoll(`${spellLevel}d4[acid]`, actorData).evaluate({async:false});
			await new MidiQOL.DamageOnlyWorkflow(tactor, tokenD, damageRoll.total, "acid", [target], damageRoll, { flavor: `(${optionName})`, itemData: itemD, itemCardId: "new" });
			await game.dice3d?.showForRoll(damageRoll);			
		}
	}
	
} catch (err) {
    console.error(`${optionName}:  ${version}`, err);
}
