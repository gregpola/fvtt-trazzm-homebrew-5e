/*
	Starting at 2nd level, you can use your Channel Divinity to wield the power of the storm with unchecked ferocity.

	When you roll lightning or thunder damage, you can use your Channel Divinity to deal maximum damage, instead of rolling.
*/
const version = "10.0.0";
const resourceName = "Channel Divinity";
const optionName = "Destructive Wrath"
const elements = { lightning: "lightning", thunder: "thunder" };

try {
	if (args[0].macroPass === "DamageBonus") {
		const lastArg = args[args.length - 1];
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		const actorToken = canvas.tokens.get(lastArg.tokenId);
		
		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			console.log(`${resourceName} - no resource found`);
			return {};
		}

		const points = actor.system.resources[resKey].value;
		if (!points) {
			console.log(`${resourceName} - resource pool is empty`);
			return {};
		}
		
		// check the damage type
		if (lastArg.workflow.damageDetail.filter(i=>i.type === "thunder" || i.type === "lightning").length < 1) {
			console.log(`${optionName} - not appropriate damage type`);
			return {};
		}

		// Ask if they want to use it
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `${resourceName}: ${optionName}`,
				content: `<p>Apply ${optionName} to ${lastArg.workflow.item.name} damage?</p>`,
				buttons: {
					one: {
						icon: '<p> </p><img src = "icons/magic/lightning/bolt-strike-blue-white.webp" width="30" height="30"></>',
						label: "<p>Yes</p>",
						callback: () => resolve(true)
					},
					two: {
						icon: '<p> </p><img src = "icons/skills/melee/weapons-crossed-swords-yellow.webp" width="30" height="30"></>',
						label: "<p>No</p>",
						callback: () => { resolve(false) }
					}
				},
				default: "two"
			}).render(true);
		});
		
		let useFeature = await dialog;
		if (useFeature) {
			await consumeResource(actor, resKey, 1);

			// Apply the damage bonus
			let damageRoll = "";
			const damageDetail = lastArg.workflow.damageDetail;
			let damageParts = lastArg.item.system.damage.parts;
			const length = damageParts.length;
			
			for (let i = 0; i < length; i++) {
				let p = damageParts[i];
				let dt = damageDetail[i];
				let match = elements[p[1]];
				if (match) {
					let maxRoll = new Roll(p[0], actor.getRollData()).evaluate({maximize : true});
					let actualRoll = dt.damage;
					let diff = Number(maxRoll.result) - actualRoll;
					if (i > 0) {
						damageRoll += ` + `;
					}
					damageRoll += `${diff}[${p[1]}]`;				
				}
			}
			
			if (damageRoll.length > 0) {
				return {damageRoll: `${damageRoll}`, flavor: optionName};
			}
		}
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
