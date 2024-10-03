const version = "12.3.0";
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
		flavor: item.name, success: success.bind(this, token, targetToken), displayResults: true, itemCardId: workflow.itemCardId,
		rollOptions: {fastForward: false, chatMessage: true, rollMode: "gmroll"}
	});

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function success(token, targetToken, results) {
	await HomebrewMacros.applyGrappled(token, targetToken, 'opposed', null, null);
	ChatMessage.create({'content': `${token.name} grapples ${targetToken.name}`})
}