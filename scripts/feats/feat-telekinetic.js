const version = "10.0.1";
const optionName = "Telekinetic";
const lastArg = args[args.length - 1];

try {
	let pusher = canvas.tokens.get(args[0].tokenId);
	let targets = args[0].failedSaves;
	if (targets && targets.length > 0) {
		let target = targets[0];
		let targetToken = game.canvas.tokens.get(target.id);
		
		new Dialog({
		  title: `${optionName} - Shove`,
		  content: "Which Shove Action?",
		  buttons: {
			A: { label: "Pull", callback: async () => {
				await HomebrewMacros.pullTarget(pusher, targetToken, 1);
				ChatMessage.create({'content': `${pusher.name} pulls ${target.name} telekinetically!`});
			} },
			B: { label: "Push", callback: async () => {
				await HomebrewMacros.pushTarget(pusher, targetToken, 1);
				ChatMessage.create({'content': `${pusher.name} pushes ${target.name} telekinetically!`});
			} },
		  }
		}).render(true);
		
	}	

} catch (err) {
    console.error(`Telekinetic shove ${version}`, err);
}
