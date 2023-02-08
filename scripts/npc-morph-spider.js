const version = "10.0.0";
const optionName = "NPC Morph (Spider)";

try {
	const lastArg = args[args.length - 1];
	const actorToken = canvas.tokens.get(lastArg.tokenId);
	const newName = "Spider Form (Drow)";
	
	if (args[0] === "on") {
		const updates = {
			token : {
				name: newName,
				scale: 2,
				"texture.src": "modules/fvtt-trazzm-homebrew-5e/assets/monsters/giant-spider.webp",
			},
			actor: {
				name: newName,
				system: {
					attributes: {
						movement: {climb: 30}
					}
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
