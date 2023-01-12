const version = "10.0.0";
const optionName = "Eldritch Master";

try {
	const lastArg = args[args.length - 1];

	if (args[0] === "on") {
		// get the actor
		let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		if (!actor) {
			return ui.notifications.error(`${optionName} - no actor found`);
		}

		// get the actor's spells
		const spells = duplicate(actor.system.spells);
		if (!spells) {
			return ui.notifications.error(`${optionName} - no spells found`);
		}
		
		const pactSlot = spells["pact"];
		if (!pactSlot) {
			return ui.notifications.error(`${optionName} - no pact spells found`);
		}

		// Replenish all pact slots
		const slot = "pact";
		const value = pactSlot.max;
		actor.update({[`spells.${slot}.value`]: value});
		
	}
	
} catch (err)  {
    console.error(`${optionName} - ${version}`, err);
}
