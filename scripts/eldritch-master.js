const version = "0.1.0";
try {
	if (args[0] === "on") {
		if (!args[2].tokenId) {
			console.error("Eldritch Master - no token");
			return {};
		}
		
		// get the actor
		const actor = canvas.tokens.get(args[2].tokenId).actor;
		if (!actor) {
			console.error("Eldritch Master - no actor");
			return {};
		}

		// get the actor's spells
		const spells = duplicate(actor.data.data.spells);
		if (!spells) {
			console.error("Eldritch Master - no spells");
			return {};
		}
		
		const pactSlot = spells["pact"];
		if (!pactSlot) {
			console.error("Eldritch Master - no pact magic");
			return {};
		}

		// Replenish all pact slots
		const slot = "pact";
		const value = pactSlot.max;
		actor.update({[`data.spells.${slot}.value`]: value});
		
	}
} catch (err)  {
    console.error(`${args[2].efData.label} - Eldritch Master ${version}`, err);
}
