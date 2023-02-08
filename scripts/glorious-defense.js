const version = "10.0.0";
const optionName = "Glorious Defense";

try {
	if (args[0].macroPass === "postActiveEffects") {
		const lastArg = args[args.length - 1];
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		let target = lastArg.targets[0];

		if (!actor || !target) {
			return ui.notifications.error(`${optionName} - no target selected`);
		}
		
		// calculate the AC bonus
		let acBonus = Math.max(actor.system.abilities.cha.mod, 1);
		const currentAC = target.actor.system.attributes.ac.value;
		const newAC = currentAC + acBonus;
		ChatMessage.create({
			content: `${actor.name} provides an AC bonus of ${acBonus} to ${target.name}, making their AC ${newAC}. Did it block the attack?`,
			speaker: ChatMessage.getSpeaker({ actor: actor })});
	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}
