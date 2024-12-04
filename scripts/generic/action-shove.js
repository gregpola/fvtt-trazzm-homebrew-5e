const version = "12.3.1";
const optionName = "Shove Action";

try {
	if (args[0].macroPass === "postActiveEffects") {
		let shover = token;
		const defender = workflow.targets.first();

		// check the size diff
		if (!HomebrewHelpers.isSizeEligibleForGrapple(shover, defender)) {
			return ui.notifications.error(`${optionName}: target is too big to shove`);
		}

		// check for incapacitated
		const isIncapacitated = defender.actor.statuses.has("incapacitated");
		if (isIncapacitated) {
			await success(shover, defender);
		}
		else {
			// Run the opposed skill check
			const bestSkill = defender.actor.system.skills.ath.total < defender.actor.system.skills.acr.total ? "acr" : "ath";
			await MidiQOL.contestedRoll({
				source: {token, rollType: "skill", ability: "ath"},
				target: {token: defender, rollType: "skill", ability: bestSkill},
				flavor: item.name, success: success.bind(this, token, defender), displayResults: true, itemCardId: workflow.itemCardId,
				rollOptions: {fastForward: false, chatMessage: true, rollMode: "gmroll"}
			});
		}

	}
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function success(shover, defender) {
	// ask which option they want to apply
	let dialog = new Promise((resolve, reject) => {
		new Dialog({
			title: optionName,
			content: "<p>Which Shove Action?</p>",
			buttons:
				{
					Prone:
						{
							label: "Shove (Prone)",
							callback: async (html) => {
								resolve(1);
							}
						},
					Push:
						{
							label: "Shove (Push)",
							callback: async (html) => {
								resolve(2);
							}
						},
					Cancel:
						{
							label: "Cancel",
							callback: () => { resolve(0) }
						}
				},
			default: "Cancel"
		}).render(true);
	});

	let optionChoice = await dialog;
	if (optionChoice) {
		if (optionChoice === 1) {
			await HomebrewEffects.applyProneEffect(defender.actor, item);
		}
		else {
			await HomebrewMacros.pushTarget(shover, defender, 1);
			ChatMessage.create({'content': `${shover.name} pushes ${defender.name} back!`});
		}
	}
}
