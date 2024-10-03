const version = "12.3.0";
const optionName = "Shove Action";

try {
	let shover = token;
	const defender = workflow.targets.first();

	// check the size diff
	if (!HomebrewHelpers.isSizeEligibleForGrapple(shover, defender)) {
		return;
	}

	// Run the opposed skill check
	const bestSkill = defender.actor.system.skills.ath.total < defender.actor.system.skills.acr.total ? "acr" : "ath";
	await MidiQOL.contestedRoll({
		source: {token, rollType: "skill", ability: "ath"},
		target: {token: defender, rollType: "skill", ability: bestSkill},
		flavor: item.name, success: success.bind(this, token, defender), displayResults: true, itemCardId: workflow.itemCardId,
		rollOptions: {fastForward: false, chatMessage: true, rollMode: "gmroll"}
	});

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function success(shover, defender, results) {
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
			await shoveProne(shover, defender);
		}
		else {
			await HomebrewMacros.pushTarget(shover, defender, 1);
			ChatMessage.create({'content': `${shover.name} pushes ${defender.name} back!`});
		}
	}
}

async function shoveProne(shover, defender){
	const uuid = defender.actor.uuid;
	const hasEffectApplied = await game.dfreds.effectInterface.hasEffectApplied('Prone', uuid);
	if (!hasEffectApplied) {
		await game.dfreds.effectInterface.addEffect({
			'effectName': 'Prone',
			'uuid': uuid,
			'origin': shover.uuid,
			'overlay': false
		});
		ChatMessage.create({'content': `${shover.name} knocks ${defender.name} prone!`});
	}
}
