/*
	Immediately after you hit a creature with a melee attack on your turn, you can expend one superiority die and then try
	to grapple the target as a bonus action (see the Player’s Handbook for rules on grappling). Add the superiority die
	to your Strength (Athletics) check. If successful, the target is Grappled.
*/
const version = "12.3.0";
const optionName = "Grappling Strike";
const featureName = "Superiority Dice";
const cost = 1;

try {
	const targetToken = workflow.targets.first();
	if (args[0].macroPass === "postActiveEffects" && targetToken) {
		if (HomebrewHelpers.isSizeEligibleForGrapple(token, targetToken)) {
			// Run the opposed skill check
			const bestSkill = targetToken.actor.system.skills.ath.total < targetToken.actor.system.skills.acr.total ? "acr" : "ath";
			await MidiQOL.contestedRoll({
				source: {token, rollType: "skill", ability: "ath"},
				target: {token: targetToken, rollType: "skill", ability: bestSkill},
				flavor: item.name, success: success.bind(this, token, targetToken, item), displayResults: true, itemCardId: workflow.itemCardId,
				rollOptions: {fastForward: false, chatMessage: true, rollMode: "gmroll"}
			});

		}
		else {
			ui.notifications.error(`${optionName}: ${targetToken.name} is too big to grapple!`);
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function success(token, targetToken, item) {
	await HomebrewMacros.applyGrappled(token, targetToken, item, 'opposed');
}
