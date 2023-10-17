/*
	When you make a weapon attack roll against a creature, you can expend one superiority die to add it to the roll. You can use this maneuver before or after making the attack roll, but before any effects of the attack are applied.
*/
const version = "10.0.0";
const resourceName = "Superiority Dice";
const optionName = "Precision Attack";

try {
	const lastArg = args[args.length - 1];

	if (lastArg.macroPass === "preCheckHits") {
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		let target = Array.from(this.targets)[0].actor;
		const attackTotal = this.attackTotal;

		// Find resource
		let resKey = findResource(actor);
		if (!resKey) {
			console.log(`${optionName} : ${resourceName} - no resource found`);
			return;
		}

		const points = actor.system.resources[resKey].value;
		if (!points) {
			console.log(`${optionName} : ${resourceName} - resource pool is empty`);
			return;
		}
		
		const fullSupDie = actor.system.scale["battle-master"]["superiority-die"];
		if (!fullSupDie) {
			return ui.notifications.error(`${actor.name} does not have a superiority die`);
		}		

		// make sure the attempted hit was made with a weapon attack
		if (!["mwak", "rwak"].includes(lastArg.itemData.system.actionType)) {
			console.log(`${optionName}: not an eligible attack`);
			return {};
		}

		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `${optionName}`,
				content: `<p>Your attack total is: ${attackTotal}, do you want to apply ${optionName} to it?</p><p>(${points} superiority dice remaining)</p>`,
				buttons: {
					one: {
						icon: '<p> </p><img src = "icons/skills/ranged/arrow-strike-apple-orange.webp" width="50" height="50"></>',
						label: "<p>Yes</p>",
						callback: () => resolve(true)
					},
					two: {
						icon: '<p> </p><img src = "icons/skills/melee/weapons-crossed-swords-yellow.webp" width="50" height="50"></>',
						label: "<p>No</p>",
						callback: () => { resolve(false) }
					}
				},
				default: "two"
			}).render(true);
		});

		let useFeature = await dialog;
		if (useFeature) {
			let attackRoll = new Roll(`${attackTotal} + ${fullSupDie.die}`).roll({async:false});
			this.setAttackRoll(attackRoll);
			await consumeResource(actor, resKey, 1);
		}
	}
	return;

} catch (err) {
    console.error(`${optionName} : ${version}`, err);
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
