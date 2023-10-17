const version = "10.0.0";
const optionName = "Lifedrinker";

try {
	const lastArg = args[args.length - 1];
	let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		
	if (args[0].macroPass === "DamageBonus") {
		// Check if the attacking item is the actor's pact weapon
		let flag = DAE.getFlag(actor, `pact-weapon`);
		if (flag && flag.id === lastArg.item._id) {
			const chaBonus = actor?.system?.abilities?.cha?.mod ?? 1;
			return {damageRoll: `${chaBonus}[necrotic]`, flavor: `${optionName} Damage`};
		}
		
	}

} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}
