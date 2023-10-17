const version = "10.0.0";
const optionName = "Shapechanger (Quasit)";

try {
	const lastArg = args[args.length - 1];
	const actorToken = canvas.tokens.get(lastArg.tokenId);
	
	if (args[0] === "on") {
		// ask which form
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `${optionName}`,
				content: `Which beast form?`,
				buttons: {
					bat: {
						icon: '<img src = "modules/fvtt-trazzm-homebrew-5e/assets/monsters/npc-Bat.webp" width="50" height="50"/>',
						label: "<p>Bat</p>",
						callback: () => {
							resolve({name: "Bat Form (Quasit)", 
							img: "modules/fvtt-trazzm-homebrew-5e/assets/monsters/npc-Bat.webp",
							walk: 10,
							climb: 0,
							fly: 40,
							swim: 0});
						}
					},
					centipede: {
						icon: '<img src = "modules/fvtt-trazzm-homebrew-5e/assets/monsters/giant-centipede.webp" width="50" height="50"/>',
						label: "<p>Centipede</p>",
						callback: () => {
							resolve({name: "Centipede Form (Quasit)", 
							img: "modules/fvtt-trazzm-homebrew-5e/assets/monsters/giant-centipede.webp",
							walk: 40,
							climb: 40,
							fly: 0,
							swim: 0});
						}
					},
					toad: {
						icon: '<img src = "modules/fvtt-trazzm-homebrew-5e/assets/monsters/giant-toad.jpg" width="50" height="50"/>',
						label: "<p>Toad</p>",
						callback: () => {
							resolve({name: "Toad Form (Quasit)", 
							img: "modules/fvtt-trazzm-homebrew-5e/assets/monsters/giant-toad.jpg",
							walk: 40,
							climb: 0,
							fly: 0,
							swim: 40});
						}
					},
					cancel: {
						label: "<p>Cancel</p>",
						callback: () => { 
							resolve(null);
						}
					}
				},
				default: "cancel"
			}).render(true);
		});

		let result = await dialog;
		
		if (result) {
			const updates = {
				token : {
					name: result.name,
					"texture.src": result.img,
				},
				actor: {
					name: result.name,
					system: {
						attributes: {
							movement: {
								walk: result.walk,
								climb: result.climb,
								fly: result.fly,
								swim: result.swim
							}
						}
					}
				}
			}
			
			/* Mutate the actor */
			await warpgate.mutate(actorToken.document, updates);
		}
	}
	else if (args[0] === "off") {
		await warpgate.revert(actorToken.document);
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
