/*
	At 6th level, you gain the ability to channel your ki into searing waves of energy. Immediately after you take the Attack action on your turn, you can spend 2 ki points to cast the burning hands spell as a bonus action.

	You can spend additional ki points to cast burning hands as a higher-level spell. Each additional ki point you spend increases the spell’s level by 1. The maximum number of ki points (2 plus any additional points) that you can spend on the spell equals half your monk level.
*/
const version = "10.0.0";
const resourceName = "Ki Points";
const optionName = "Searing Arc Strike";
const optionCost = 2;

try {
	const lastArg = args[args.length - 1];

	if (args[0].macroPass === "preItemRoll") {
		let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);

		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			ui.notifications.error(`${optionName}: ${resourceName}: - no resource found`);
			return false;
		}

		// check available points
		const points = actor.system.resources[resKey].value;
		if (!points) {
			ui.notifications.error(`${optionName}: ${resourceName}: - out of resources`);
			return false;
		}
				
		if (points < optionCost) {
			ui.notifications.error(`${optionName}: ${resourceName} - not enough points (need ${optionCost})`);
			return false;
		}
		
		// Ask how many Ki points to spend
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: optionName,
				content: `<p>How many Ki points do you want to spend? (${points} remaining)</p>
					<p>(minimum of 2, maximum of ${points})</p>
					<p><input id="kipoints" type="number" value="${optionCost}" min="${optionCost}" step="1.0" max="${points}" style="width: 75px;"></input></p>`,
				buttons: {
					one: {
						icon: '<i class="fas fa-check"></i>',
						label: "Cast",
						callback: async (html) => {
							const pts = Math.clamped(Math.floor(Number(html.find('#kipoints')[0].value)), 2, points);
							resolve(pts)
						}
					},
					two: {
						icon: '<i class="fas fa-times"></i>',
						label: "No",
						callback: () => { resolve(0) }
					}
				},
				default: "two"
			}).render(true);
		});
		let pointsSpent = await dialog;
		
		if (pointsSpent > 0) {
			let damageDice = Number(pointsSpent) + 1;
			const damageUpdate = `${damageDice}d6`;
			const sourceItem = await fromUuid(lastArg.uuid);
			let damageParts = sourceItem.system.damage.parts;
			damageParts[0][0] = damageUpdate;
			await sourceItem.update({"system.damage.parts": damageParts});
			await warpgate.wait(100);
			await consumeResource(actor, resKey, pointsSpent);
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
