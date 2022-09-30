const version = "0.1.0";
try {
	const optionName = "Careful Spell";
	const cost = 1;
	
	if (args[0] === "on") {
		if (!args[2].tokenId) {
			console.error('Metamagic: ${optionName} - no token');
			return {};
		}
		
		// data init
		const actor = canvas.tokens.get(args[2].tokenId).actor;
		
		// data validation
		if (!actor) {
			console.error('Metamagic: ${optionName} - no actor');
			return {};
		}
		if (!actor.data.data.resources.primary) {
			console.error('Metamagic: ${optionName} - no resource found');
			return {};
		}

		const points = actor.data.data.resources.primary.value;
		const pointsMax = actor.data.data.resources.primary.max;
		await actor.update({"data.resources.primary.value": Math.clamped(points - cost, 0, pointsMax)});
	}
	
} catch (err)  {
    console.error(`${args[1].efData.label} - Metamagic: ${optionName} ${version}`, err);
}
