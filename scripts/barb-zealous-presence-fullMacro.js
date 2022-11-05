const version = "0.1.0";
const optionName = "Zealous Presence"

try {
	const lastArg = args[args.length - 1];
	let token = canvas.tokens.get(args[0].tokenId);
	
	if (args[0].macroPass === "preItemRoll") {
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		let actor = workflow?.actor;
		
		// find nearby targets
		const friendlyTargets = MidiQOL.findNearby(1, token, 60, 0);
		const neutralTargets = MidiQOL.findNearby(0, token, 60, 0);
		let recipients = [...friendlyTargets, ...neutralTargets];
		
		// ask which ones to inspire
		// One row per potential target
		let rows = "";
		for (var i = 0; i < recipients.length; i++) {
			let r = recipients[i];
			let row = `<div class="flexrow"><input type="checkbox" style="margin-right:10px;"/><label>${r.name}</label></div>`;
			rows += row;
		}
		
		// build the dialog content
		let content = `
		  <form>
			<div class="flexcol">
				<div class="flexrow" style="margin-bottom: 10px;"><label>Who do you choose to infuse with fury? (max 10):</label></div>
				<div id="targetRows" class="flexcol"style="margin-bottom: 10px;">
					${rows}
				</div>
			</div>
		  </form>`;
		
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				title: `${optionName}`,
				content,
				buttons:
				{
					Ok:
					{
						label: `Ok`,
						callback: async (html) => {
							// count the cost of the selections
							let appliedTargets = new Set();
							let spent = 0;
							var grid = document.getElementById("targetRows");
							var checkBoxes = grid.getElementsByTagName("INPUT");
							for (var i = 0; i < checkBoxes.length; i++) {
								if (checkBoxes[i].checked) {
									var row = checkBoxes[i].parentNode;
									appliedTargets.add(recipients[i]);
									spent += 1;
								}
							}
							
							if (!spent) {
								resolve(false);
							}
							else if (spent > 10) {
								ui.notifications.error(`${optionName} - too many targets selected`);
								resolve(false);
							}
							else {
								// apply the effect
								for (let ttoken of appliedTargets) {
									await applyBuff(actor, ttoken);
								}
							}
							resolve(true);
						}
					},
					Cancel:
					{
						label: `Cancel`,
						callback: () => { resolve(false) }
					}
				}
			}).render(true);
		});
		
		let useFeature = await dialog;
		return(useFeature);
	}
	
} catch (err) {
	console.error(`${optionName} ${version}`, err);
}

// Apply the buff effects
async function applyBuff(actor, ttoken) {
	const effectData = {
		label: `${optionName}`,
		icon: "icons/skills/social/intimidation-impressing.webp",
		origin: actor.id,
		changes: [
			{
				key: 'flags.midi-qol.advantage.attack.all',
				mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
				value: 1,
				priority: "20"
			},
			{
				key: 'flags.midi-qol.advantage.ability.save.all',
				mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
				value: 1,
				priority: "20"
			}			
		],
		flags: {
			dae: {
				selfTarget: false,
				stackable: "none",
				durationExpression: "",
				macroRepeat: "none",
				specialDuration: [
					"turnEndSource"
				],
				transfer: false
			}
		},
		disabled: false
	};
	await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: ttoken.actor.uuid, effects: [effectData] });
}
