const version = "10.0.0";
const optionName = "Mist Form";

try {
	const lastArg = args[args.length - 1];
	const actorToken = canvas.tokens.get(lastArg.tokenId);
	const newName = `${optionName} (Yochlol)`;
	
	if (args[0] === "on") {
		const updates = {
			token : {
				name: newName,
				scale: 2,
				"texture.src": "icons/magic/air/wind-tornado-funnel-green.webp",
			},
			actor: {
				name: newName,
				system: {
					attributes: {
						movement: {
							fly: 30,
							hover: true
						}
					},
					traits: {
						di: {
							value: [
							"poison",
							"physical"
							]
						}
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