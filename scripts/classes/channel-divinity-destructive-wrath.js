/*
	Starting at 2nd level, you can use your Channel Divinity to wield the power of the storm with unchecked ferocity.

	When you roll lightning or thunder damage, you can use your Channel Divinity to deal maximum damage, instead of rolling.
*/
const version = "11.0";
const optionName = "Destructive Wrath"
const channelDivinityName = "Channel Divinity (Cleric)";
const cost = 1;
const elements = { lightning: "lightning", thunder: "thunder" };

try {
	if (args[0].macroPass === "DamageBonus") {
		// check Channel Divinity uses available
		let channelDivinity = actor.items.find(i => i.name === channelDivinityName);
		if (channelDivinity) {
			let usesLeft = channelDivinity.system.uses?.value ?? 0;
			if (!usesLeft || usesLeft < cost) {
				console.error(`${optionName} - not enough ${channelDivinityName} uses left`);
				return {};
			}
		}
		else {
			console.error(`${optionName} - no ${channelDivinityName} item on actor`);
			return {};
		}
		// Haves uses remaining

		// check the damage type
		if (workflow.damageDetail.filter(i=>i.type === "thunder" || i.type === "lightning").length < 1) {
			console.log(`${optionName} - not appropriate damage type`);
			return {};
		}

		// Ask if they want to use it
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `${channelDivinityName}: ${optionName}`,
				content: `<p>Apply ${optionName} to ${item.name} damage?</p>`,
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
			const newValue = channelDivinity.system.uses.value - cost;
			await channelDivinity.update({"system.uses.value": newValue});

			// Apply the damage bonus
			let damageRoll = "";
			const damageDetail = workflow.damageDetail;
			let damageParts = item.system.damage.parts;
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
	console.error(`${optionName} : ${version}`, err);
}
