/*
	Immediately after you deal damage to a creature with your Divine Smite feature, you can use your Channel Divinity as a bonus action and distribute temporary hit points to creatures of your choice within 30 feet of you, which can include you. The total number of temporary hit points equals 2d8 + your level in this class, divided among the chosen creatures however you like.
*/
const version = "10.0.0";
const resourceName = "Channel Divinity";
const optionName = "Inspiring Smite"
const lastArg = args[args.length - 1];

try {
	if (args[0].macroPass === "preItemRoll") {
		let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		let actorToken = canvas.tokens.get(lastArg.tokenId);
		
		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			ui.notifications.error(`${optionName}: ${resourceName} - no resource found`);
			return false;
		}

		const points = actor.system.resources[resKey].value;
		if (!points) {
			ui.notifications.error(`${optionName}: ${resourceName} - resource pool is empty`);
			return false;
		}
		
		// find nearby allies
		const friendlyTargets = MidiQOL.findNearby(1, actorToken, 30, 0);
		const neutralTargets = MidiQOL.findNearby(0, actorToken, 30, 0);
		let recipients = [actorToken, ...friendlyTargets, ...neutralTargets];
		
		// roll the total temp HP to spend
		const paladinLevel = actor.classes.paladin?.system.levels ?? 0;
		const tempHpRoll = await new Roll(`2d8 + ${paladinLevel}`).evaluate({ async: false });
		await game.dice3d?.showForRoll(tempHpRoll);
		const totalTempHp = tempHpRoll.total;
		
		// ask which ones to heal and how much
		// One row per potential target
		let rows = "";
		for (var i = 0; i < recipients.length; i++) {
			let r = recipients[i];
			let row = `<div class="flexrow"><label>${r.name}</label>` 
				+ `<input id="hp_` + i + `" type="number" min="0" step="1.0" max="${totalTempHp}"></input></div>`;
			rows += row;
		}
		
		// build the dialog content
		let content = `
		  <form>
			<div class="flexcol">
				<div class="flexrow" style="margin-bottom: 10px;"><label>Distribute the ${totalTempHp} temporary hit points available:</label></div>
				<div id="targetRows" class="flexcol"style="margin-bottom: 10px;">
					${rows}
				</div>
			</div>
		  </form>`;
		
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				title: `${resourceName}: ${optionName}`,
				content,
				buttons:
				{
					Ok:
					{
						label: `Ok`,
						callback: async (html) => {
							// count the cost of the selections
							let recoveredData = new Set();
							let spent = 0;
							var grid = document.getElementById("targetRows");
							var healFields = grid.getElementsByTagName("INPUT");
							for (var i = 0; i < healFields.length; i++) {
								let rowPoints = Number(healFields[i].value);
								if (rowPoints) {
									spent += rowPoints;
									let recipientIndex = Number(healFields[i].id.substr(healFields[i].id.indexOf('_')+1));
									recoveredData.add([recipientIndex, rowPoints]);
								}
							}
							
							if (!spent) {
								resolve(false);
							}
							else if (spent > totalTempHp) {
								ui.notifications.error(`$${optionName} - too many temp hp assigned`);
								resolve(false);
							}
							else {
								// apply the healing
								for (let rd of recoveredData) {
									let ttoken = recipients[rd[0]];
									let pts = rd[1];
									const damageRoll = await new Roll(`${pts}`).evaluate({ async: false });
									await new MidiQOL.DamageOnlyWorkflow(actor, actorToken, damageRoll.total, "temphp", [ttoken], damageRoll, 
										{flavor: `${optionName}`, itemCardId: lastArg.itemCardId});
								}
								await consumeResource(actor, resKey, 1);
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
	console.error(`${resourceName}: ${optionName} ${version}`, err);
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
		const resourcePath = `system.resources.${resKey}`;
		resources[resKey].value = Math.clamped(value - cost, 0, max);
		await actor.update({ "system.resources": resources });
		return true;
	}
}
