const version = "11.0";
const optionName = "Grapple Action";
const actorSizes = ["tiny","sm","med","lg", "huge", "grg"];

try {
	const targetToken = workflow.targets.first();

	// check the size diff
	if (!isSizeEligible(token, targetToken)) {
		return ui.notifications.error(`${optionName} - target is too big to grapple`);
	}

	// Run the opposed skill check
	const skilltoberolled = targetToken.actor.system.skills.ath.total < targetToken.actor.system.skills.acr.total ? "acr" : "ath";
	let results = await game.MonksTokenBar.requestContestedRoll({token: token, request: 'skill:ath'},
		{token: targetToken, request:`skill:${skilltoberolled}`},
		{silent:true, fastForward:false, flavor: `${targetToken.name} tries to resist ${token.name}'s grapple attempt`});

	let i=0;
	while (results.flags['monks-tokenbar'][`token${token.id}`].passed === "waiting" && i < 30) {
		await new Promise(resolve => setTimeout(resolve, 500));
		i++;
	}

	let result = results.flags["monks-tokenbar"][`token${token.id}`].passed;
	if (result === "won" || result === "tied") {
		await HomebrewMacros.applyGrappled(token, targetToken, 'opposed', null, null);
		ChatMessage.create({'content': `${token.name} grapples ${targetToken.name}`})
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

function isSizeEligible(grappler, defender) {
	const grapplerSize = grappler.actor.system.traits.size;
	const defenderSize = defender.actor.system.traits.size;
	const gindex = actorSizes.indexOf(grapplerSize);
	const dindex = actorSizes.indexOf(defenderSize);
	return (dindex <= (gindex + 1));
}
