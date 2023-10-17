/*
	Starting at 6th level, the divine energy coursing through you can empower healing spells. Whenever you or an ally within 5 feet of you rolls dice to determine the number of hit points a spell restores, you can spend 1 sorcery point to reroll any number of those dice once, provided you aren’t Incapacitated. You can use this feature only once per turn.
*/
const version = "10.0.0";
const optionName = "Empowered Healing"
const resourceName = "Sorcery Points";
const cost = 1;
const timeFlag = "empoweredHealingTime";

try {
	if (args[0].macroPass === "DamageBonus") {
		const lastArg = args[args.length - 1];
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		const actorToken = canvas.tokens.get(lastArg.tokenId);
		const targetActor = lastArg.hitTargets[0].actor;
		const targetToken = game.canvas.tokens.get(lastArg.hitTargets[0].id);
		
		// make sure it's an heal
		if (!["heal"].includes(lastArg.itemData.system.actionType)) {
			console.log(`${optionName}: not a heal`);
			return {};
		}
		
		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			console.log(`${optionName}: ${resourceName} - no resource found`);
			return {};
		}

		const points = actor.system.resources[resKey].value;
		if (!points) {
			console.log(`${optionName}: ${resourceName} - resource pool is empty`);
			return {};
		}

		// Check for availability i.e. once per turn
		// skip this check if out of combat so they can use it to heal up
		if (game.combat) {
			if (!isAvailableThisTurn()) {
				console.log(`${optionName} - not available this turn`);
				return {};
			}
		}
		
		// collect the healing dice details
		let rerollDataSet = new Set();		
		let rows = "";
		for (let t of lastArg.damageRoll.terms) {
			if (t instanceof Die) {
				let row = `<div class="flexrow"><label>${t.number}d${t.faces}</label></div>`;
				rows += row;
				for (let r of t.results) {
					let dieRow = `<div><input type="checkbox" style="margin-left:25px; margin-right:10px;" value=${r.result}/><label>${r.result}</label></div>`;
					rows += dieRow;
					let dieData = [`d${t.faces}`, r.result, false, `${t.options.flavor}`];
					rerollDataSet.add(dieData);
				}
			}
		}
		let rerollData = Array.from(rerollDataSet);
		
		// build the dialog content
		let content = `
		  <form>
			<div class="flexcol">
				<div class="flexrow" style="margin-bottom: 10px;"><label>You can re-roll any of the dice:</label></div>
				<div id="dieRows" class="flexcol"style="margin-bottom: 10px;">
					${rows}
				</div>
			</div>
		  </form>
		`;

		// Ask if they want to use it
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				title: optionName,
				content,
				buttons:
				{
					Ok:
					{
						label: `Ok`,
						callback: async (html) => {
							let spent = 0;
							var grid = document.getElementById("dieRows");
							var checkBoxes = grid.getElementsByTagName("INPUT");
							for (var i = 0; i < checkBoxes.length; i++) {
								if (checkBoxes[i].checked) {
									rerollData[i][2] = true;
									spent += 1;
								}
							}

							resolve(spent > 0);
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
		if (useFeature) {
			await consumeResource(actor, resKey, cost);

			// set the time flag
			if (game.combat) {
				const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
				const lastTime = actor.getFlag("midi-qol", timeFlag);
				if (combatTime !== lastTime) {
					await actor.setFlag("midi-qol", timeFlag, combatTime)
				}
			}

			// perform the re-rolls
			let damageRollTerms = "";
			rerollData.forEach(function (item, index) {
				if (item[2]) {
					let newRoll = new Roll(item[0]).evaluate({ async: false });
					game.dice3d?.showForRoll(newRoll);
					
					let damageDiff = (newRoll.total - Number(item[1]));
					let term = `${damageDiff}[${item[3]}]`;
					if (damageRollTerms.length > 0)
						damageRollTerms += " + ";
					damageRollTerms += term;
				}
			});
			
			// return the damage diff
			return {damageRoll: damageRollTerms, flavor: `${optionName} Damage`};
		}
	}
	
} catch (err) {
	console.error(`${optionName}: ${version}`, err);
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

// Check to make sure the actor hasn't already applied the damage this turn
function isAvailableThisTurn() {
	if (game.combat) {
		const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
		const lastTime = actor.getFlag("midi-qol", timeFlag);
		if (combatTime === lastTime) {
			return false;
		}
		return true;
	}	
	return false;
}
