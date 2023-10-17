const version = "10.0.0";
const optionName = "Shapechanger";

try {
	const lastArg = args[args.length - 1];
	const actorToken = canvas.tokens.get(lastArg.tokenId);
	
	if (args[0] === "on") {
		const updates = {
			token : {
				name: "Goblin",
				"texture.src": "modules/fvtt-trazzm-homebrew-5e/assets/monsters/npc-Goblin.webp",
				width: 1,
				height: 1,
				scale: 0.8
			},
			actor: {
				name: "Goblin",
				system: {
					attributes: {
						movement: {
							walk: 30,
							climb: 0,
							fly: 0,
							swim: 0
						}
					},
					"traits.size" : "sm"
				}
			}
		}
		
		/* Mutate the actor */
		await warpgate.mutate(actorToken.document, updates);
	}
	else if (args[0] === "off") {
		await warpgate.revert(actorToken.document);
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
