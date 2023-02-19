const version = "10.0.0";
const optionName = "Shapechanger (Yochlol)";

try {
	const lastArg = args[args.length - 1];
	const actorToken = canvas.tokens.get(lastArg.tokenId);
	
	if (args[0] === "on") {
		// ask which form
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `${optionName}`,
				content: `Which form?`,
				buttons: {
					drow: {
						icon: '<img src = "modules/fvtt-trazzm-homebrew-5e/assets/monsters/npc-Drow.webp" width="50" height="50"/>',
						label: "<p>Female Drow</p>",
						callback: () => {
							resolve({name: "Female Drow", 
							img: "modules/fvtt-trazzm-homebrew-5e/assets/monsters/npc-Drow.webp"});
						}
					},
					spider: {
						icon: '<img src = "modules/fvtt-trazzm-homebrew-5e/assets/monsters/giant-spider.webp" width="50" height="50"/>',
						label: "<p>Giant Spider</p>",
						callback: () => {
							resolve({name: "Giant Spider", 
							img: "modules/fvtt-trazzm-homebrew-5e/assets/monsters/giant-spider.webp"});
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
