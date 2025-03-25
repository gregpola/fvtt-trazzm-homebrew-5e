const version = "12.3.1";
const optionName = "Grapple Action";

try {
	const targetToken = workflow.targets.first();

	// check the size diff
	if (!HomebrewHelpers.isSizeEligibleForGrapple(token, targetToken)) {
		return;
	}

	// Run the opposed skill check
	const bestSkill = targetToken.actor.system.skills.ath.total < targetToken.actor.system.skills.acr.total ? "acr" : "ath";
	await MidiQOL.contestedRoll({
		source: {token, rollType: "skill", ability: "ath"},
		target: {token: targetToken, rollType: "skill", ability: bestSkill},
		flavor: item.name, success: success.bind(this, token, targetToken, item), displayResults: true, itemCardId: workflow.itemCardId,
		rollOptions: {fastForward: false, chatMessage: true, rollMode: "gmroll"}
	});

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function success(token, targetToken, item) {
	await HomebrewMacros.applyGrappled(token, targetToken, item, 'opposed');
}
