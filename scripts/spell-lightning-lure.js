/*
	You create a lash of lightning energy that strikes at one creature of your choice that you can see within 15 feet of you. The target must succeed on a Strength saving throw or be pulled up to 10 feet in a straight line toward you and then take 1d8 lightning damage if it is within 5 feet of you.
*/
const version = "10.0.0";
const optionName = "Lightning Lure";

try {
	const lastArg = args[args.length - 1];

	if ((args[0].macroPass === "postActiveEffects") && (lastArg.failedSaves.length > 0)) {
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		const actorData = actor.getRollData();
		const actorToken = await canvas.tokens.get(lastArg.tokenId);
		const targetToken = game.canvas.tokens.get(lastArg.failedSaves[0].id);
		
		// move target
		await HomebrewMacros.pullTarget(actorToken, targetToken, 2);
		
		// apply damage if the target is close enough
		const ray = new Ray( actorToken.center, targetToken.center );
		const distance = canvas.grid.measureDistances([{ray}], {gridSpaces:true})[0];
		if ( distance <= 5) {
			const characterLevel = actor.type === "character" ? actor.system.details.level : actor.system.details.cr;
			const cantripDice = 1 + Math.floor((characterLevel + 1) / 6);
			let damageRoll = await new game.dnd5e.dice.DamageRoll(`${cantripDice}d8[lightning]`, actorData).evaluate({async:false});
			await new MidiQOL.DamageOnlyWorkflow(actor, actorToken, damageRoll.total, "lightning", [targetToken], damageRoll, { flavor: `(${optionName})`, itemData: lastArg.item, itemCardId: "new" });
			await game.dice3d?.showForRoll(damageRoll);
		}
	}
	
} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
