const version = "0.1.0";
const resourceName = "Channel Divinity";
const optionName = "Destructive Wrath"
const elements = { lightning: "lightning", thunder: "thunder" };

try {
	const lastArg = args[args.length - 1];
	let tactor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	let token = canvas.tokens.get(args[0].tokenId);
	
	if (args[0].macroPass === "DamageBonus") {
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		let actor = workflow?.actor;
		
		// check resources
		let resKey = findResource(tactor);
		if (!resKey) {
			console.log(`${resourceName} - no resource found`);
			return {};
		}

		const points = tactor.data.data.resources[resKey].value;
		if (!points) {
			console.log(`${resourceName} - resource pool is empty`);
			return {};
		}
		
		// check the damage type
		if (workflow.damageDetail.filter(i=>i.type === "thunder" || i.type === "lightning").length < 1) {
			console.log(`${optionName} - not appropriate damage type`);
			return {};
		}

		// Ask if they want to use it
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `${resourceName}: ${optionName}`,
				content: `<p>Apply ${optionName} to ${workflow.item.name} damage?</p>`,
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
			const damageDetail = workflow.damageDetail;
			let damageParts = workflow.item?.data?.data?.damage?.parts;
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

function termMax(part) {
	return part[0][0];
}


// find the resource
function findResource(actor) {
	if (actor) {
		for (let res in actor.data.data.resources) {
			if (actor.data.data.resources[res].label === resourceName) {
			  return res;
			}
		}
	}
	
	return null;
}

// handle resource consumption
async function consumeResource(actor, resKey, cost) {
	if (actor && resKey && cost) {
		const points = actor.data.data.resources[resKey].value;
		if (!points) {
			ChatMessage.create({'content': '${resourceName} : Out of resources'});
			return;
		}
		const pointsMax = actor.data.data.resources[resKey].max;
		let resources = duplicate(actor.data.data.resources); // makes a duplicate of the resources object for adjustments.
		resources[resKey].value = Math.clamped(points - cost, 0, pointsMax);
		await actor.update({"data.resources": resources});    // do the update to the actor.
	}
}
