/*
	Immediately after you hit a creature with a melee attack on your turn, you can expend one superiority die and then try
	to grapple the target as a bonus action (see the Player’s Handbook for rules on grappling). Add the superiority die
	to your Strength (Athletics) check. If successful, the target is Grappled.
*/
const version = "11.0";
const optionName = "Grappling Strike";
const featureName = "Superiority Dice";
const cost = 1;

try {
	if (args[0].macroPass === "preItemRoll") {
		// check for available uses
		let featureItem = actor.items.find(i => i.name === featureName);
		if (featureItem) {
			let usesLeft = featureItem.system.uses?.value ?? 0;
			if (!usesLeft || usesLeft < cost) {
				console.error(`${optionName} - not enough ${featureName} uses left`);
				ui.notifications.error(`${optionName} - not enough ${featureName} uses left`);
			}
			else {
				const newValue = featureItem.system.uses.value - cost;
				await featureItem.update({"system.uses.value": newValue});
				return true;
			}
		}
		else {
			console.error(`${optionName} - no ${featureName} item on actor`);
			ui.notifications.error(`${optionName} - no ${featureName} item on actor`);
		}

		ui.notifications.error(`${featureName} - feature not found`);
		return false;
	}
	else if (args[0].macroPass === "postActiveEffects") {
		// Attempt the grapple
		const targetToken = workflow.targets.first();
		ChatMessage.create({'content': `${actor.name} tries to grapple ${targetToken.name}`});
		const skilltoberolled = targetToken.actor.system.skills.ath.total < targetToken.actor.system.skills.acr.total ? "acr" : "ath";

		await game.MonksTokenBar.requestContestedRoll(
			{ token: token, request: 'skill:ath' },
			{ token: targetToken, request:`skill:${skilltoberolled}` },
			{ silent:true,
				fastForward:false,
				flavor: `${targetToken.name} tries to resist ${token.name}'s grapple attempt`,
				callback: async (result) => {
					if (result.tokenresults[0].passed) {
						await HomebrewMacros.applyGrappled(token, targetToken, 'opposed', null, null);
						ChatMessage.create({'content': `${token.name} grapples ${targetToken.name}`})
					}
					else {
						ChatMessage.create({'content': `${actor.name} fails to grapple ${targetToken.name}`});
					}
				}
			});
	}

} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}
