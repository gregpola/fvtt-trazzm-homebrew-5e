const version = "10.0.0";
const optionName = "Chilling Mist";

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);
	
	if (args[0].macroPass === "DamageBonus") {
		let targetToken = canvas.tokens.get(args[0].hitTargets[0].id ?? args[0].hitTargers[0]._id);
		let distance = MidiQOL.getDistance(t, targetToken, false);
		if (distance <= 10) {
			return {damageRoll: '1d10[cold]', flavor: `${optionName} Damage`};
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
