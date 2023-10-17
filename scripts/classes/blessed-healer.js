/*
	Beginning at 6th level, the healing spells you cast on others heal you as well. When you cast a spell of 1st level or higher that restores hit points to a creature other than you, you regain hit points equal to 2 + the spell’s level.
*/
const version = "10.0.0";
const optionName = "Blessed Healer";

try {
	if (args[0].macroPass === "DamageBonus") {	
		const lastArg = args[args.length - 1];
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		const targetActor = lastArg.targets[0].actor;

		// make sure it's an allowed attack
		if (!["heal"].includes(lastArg.itemData.system.actionType)) {
			console.log(`${optionName}: not an eligible actionType`);
			return {};
		}
		
		// make sure the target is not the actor
		if (actor === targetActor) {
			console.log(`${optionName}: must target someone else`);
			return {};
		}
		
		// get the spell level
		if (lastArg.spellLevel < 1) {
			console.log(`${optionName}: spell level must be at least 1`);
			return {};
		}

		// add the healing to the actor
		const healingBonus = 2 + lastArg.spellLevel;
		const wounds = actor.system.attributes.hp.max - actor.system.attributes.hp.value;
		const healAmount = Math.min(healingBonus, wounds);
		const hp = actor.system.attributes.hp.value + healAmount;
		await actor.update({"system.attributes.hp.value": hp});
		ChatMessage.create({
			content: `${actor.name} was blessed with ${healAmount} healing`,
			speaker: ChatMessage.getSpeaker({ actor: actor })});
	}

} catch (err) {
    console.error(`${optionName}:  ${version}`, err);
}
