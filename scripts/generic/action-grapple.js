const version = "10.1";
const optionName = "Grapple Action";
const actorSizes = ["tiny","sm","med","lg", "huge", "grg"];

try {
	const defender = workflow.targets.first();
	
	// check the size diff
	if (!isSizeEligible(token, defender)) {
		return ui.notifications.error(`${optionName} - target is too big to grapple`);
	}

	// Run the opposed skill check
	const skilltoberolled = defender.actor.system.skills.ath.total < defender.actor.system.skills.acr.total ? "acr" : "ath";
	let results = await game.MonksTokenBar.requestContestedRoll({token: token, request: 'skill:ath'},
		{token: defender, request:`skill:${skilltoberolled}`},
		{silent:true, fastForward:false, flavor: `${defender.name} tries to resist ${token.name}'s grapple attempt`});

	let i=0;
	while (results.flags['monks-tokenbar'][`token${token.id}`].passed === "waiting" && i < 30) {
		await new Promise(resolve => setTimeout(resolve, 500));
		i++;
	}

	let result = results.flags["monks-tokenbar"][`token${token.id}`].passed;
	if (result === "won" || result === "tied") {
		await HomebrewMacros.applyGrappled(token, defender, 'opposed', null, null);
		ChatMessage.create({'content': `${token.name} grapples ${defender.name}`})
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
