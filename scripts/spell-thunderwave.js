const version = "10.0.1";

try {
	const lastArg = args[args.length - 1];
	let pusher = canvas.tokens.get(lastArg.tokenId);
	let targets = lastArg.failedSaves;
	if (targets && targets.length > 0) {
		for (let target of targets) {
			await HomebrewMacros.pushTarget(pusher, target.object, 2);
		}
	}	

} catch (err) {
    console.error(`Thunderwave push ${version}`, err);
}
