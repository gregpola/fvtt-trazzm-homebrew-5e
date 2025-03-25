/*
	You can add your Intelligence modifier (minimum of +1) to the damage of your melee weapon attacks while your Bladesong is active.
*/
const version = "10.0.0";
const optionName = "Song of Victory";

try {
	if (args[0].macroPass === "DamageBonus") {	
		const lastArg = args[args.length - 1];
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);

		// make sure the actor has Bladesong active
		let effect = actor.effects.find(i=> i.label === "Bladesong");
		if (!effect) {
			console.log(`${actor.name} - unable to use ${optionName} because Bladesong is not active`);
			return {};
		}			

		// make sure it's an allowed attack
		if (!["mwak"].includes(lastArg.itemData.system.actionType)) {
			console.log(`${optionName}: not an eligible attack`);
			return {};
		}

		// add damage bonus
		const abilityBonus = Math.max(actor.system.abilities.int.mod, 1);
		return {damageRoll: `${abilityBonus}`, flavor: optionName};
	}


} catch (err) {
    console.error(`${optionName}:  ${version}`, err);
}
