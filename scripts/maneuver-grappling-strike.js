/*
	Immediately after you hit a creature with a melee attack on your turn, you can expend one superiority die and then try
	to grapple the target as a bonus action (see the Player’s Handbook for rules on grappling). Add the superiority die
	to your Strength (Athletics) check. If successful, the target is Grappled.
*/
const version = "10.1";
const resourceName = "Superiority Dice";
const optionName = "Grappling Strike";

try {
	if (args[0].macroPass === "preItemRoll") {
		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			ui.notifications.error(`${resourceName} - no resource found`);
			return false;
		}

		// handle resource consumption
		return await consumeResource(actor, resKey, 1);
	}
	else if (args[0].macroPass === "postActiveEffects") {
		const defender = workflow.targets.first();

		// Attempt the grapple
		ChatMessage.create({'content': `${actor.name} tries to grapple ${defender.name}`});
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
		else {
			ChatMessage.create({'content': `${actor.name} fails to grapple ${defender.name}`});
		}
	}

} catch (err) {
    console.error(`${resourceName}: ${optionName} - ${version}`, err);
}

// find the resource matching this feature
function findResource(actor) {
	if (actor) {
		for (let res in actor.system.resources) {
			if (actor.system.resources[res].label === resourceName) {
			  return res;
			}
		}
	}
	
	return null;
}

// handle resource consumption
async function consumeResource(actor, resKey, cost) {
	if (actor && resKey && cost) {
		const {value, max} = actor.system.resources[resKey];
		if (!value) {
			ChatMessage.create({'content': '${resourceName} : Out of resources'});
			return false;
		}
		
		const resources = foundry.utils.duplicate(actor.system.resources);
		resources[resKey].value = Math.clamped(value - cost, 0, max);
		await actor.update({ "system.resources": resources });
		return true;
	}
}
