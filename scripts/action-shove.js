const version = "10.1";
const optionName = "Shove Action";
const lastArg = args[args.length - 1];
const actorSizes = ["tiny","sm","med","lg", "huge", "grg"];

try {
	let shover = canvas.tokens.get(lastArg.tokenId);
	const defender = lastArg.targets[0];
	
	// check the size diff
	if (!isSizeEligible(shover, defender)) {
		return ui.notifications.error(`${optionName} - target is too big to shove`);
	}

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
	if (!optionChoice) return;

	// Run the opposed skill check
	const skilltoberolled = defender.actor.system.skills.ath.total < defender.actor.system.skills.acr.total ? "acr" : "ath";
	let results = await game.MonksTokenBar.requestContestedRoll({token: shover, request: 'skill:ath'},
		{token: defender, request:`skill:${skilltoberolled}`},
		{silent:true, fastForward:false, flavor: `${defender.name} tries to resist ${shover.name}'s shove attempt`});

	let i=0;
	while (results.flags['monks-tokenbar'][`token${shover.id}`].passed === "waiting" && i < 30) {
		await new Promise(resolve => setTimeout(resolve, 500));
		i++;
	}

	let result = results.flags["monks-tokenbar"][`token${shover.id}`].passed;
	if (result === "won" || result === "tied") {
		if (optionChoice === 1) {
			await shoveProne(shover, defender);
		}
		else {
			await HomebrewMacros.pushTarget(shover, defender.object, 1);
			ChatMessage.create({'content': `${shover.name} pushes ${defender.name} back!`});
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

function isSizeEligible(shover, defender) {
	const shoverSize = shover.actor.system.traits.size;
	const defenderSize = defender.actor.system.traits.size;
	const gindex = actorSizes.indexOf(shoverSize);
	const dindex = actorSizes.indexOf(defenderSize);
	return (dindex <= (gindex + 1));
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
