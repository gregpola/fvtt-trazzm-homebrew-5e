const version = "10.0.0";
const optionName = "Grapple Action";
const lastArg = args[args.length - 1];

try {
	let grappler = canvas.tokens.get(lastArg.tokenId);
	const defender = lastArg.targets[0];

	const skilltoberolled = defender.actor.system.skills.ath.total < defender.actor.system.skills.acr.total ? "acr" : "ath";
	let results = await game.MonksTokenBar.requestContestedRoll({token: grappler, request: 'skill:ath'},
		{token:lastArg.targets[0],
		request:`skill:${skilltoberolled}`},
		{silent:true, fastForward:false, flavor: `${defender.name} tries to resist ${grappler.name}'s shove attempt`});

	let i=0;
	while (results.flags['monks-tokenbar'][`token${grappler.id}`].passed === "waiting" && i < 30) {
		await new Promise(resolve => setTimeout(resolve, 500));
		i++;
	}

	if (results.flags["monks-tokenbar"][`token${grappler.id}`].passed === "won") {
		if(!game.dfreds.effectInterface.hasEffectApplied('Grappled', defender.actor.uuid)) {
			await game.dfreds.effectInterface.addEffect({ effectName: 'Grappled', uuid: defender.actor.uuid});
			ChatMessage.create({'content': `${grappler.name} grabs ahold of ${defender.name}`})
		}
		
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
