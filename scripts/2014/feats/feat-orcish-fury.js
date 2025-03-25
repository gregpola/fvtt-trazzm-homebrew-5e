/*
	When you hit with an attack using a simple or martial weapon, you can roll one of the weapon’s damage dice an additional time and add it as extra damage of the weapon’s damage type. Once you use this ability, you can’t use it again until you finish a short or long rest.
*/
const version = "10.0.0";
const optionName = "Orcish Fury";

try {
	if (args[0].macroPass === "DamageBonus") {	
		const lastArg = args[args.length - 1];
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		const actorToken = canvas.tokens.get(lastArg.tokenId);
		
		// first check if there is a use available
		let featureItem = actor.items.getName(optionName);
		let uses = featureItem?.system?.uses?.value ?? 0;
		if (!uses) {
			console.log(`${optionName} - no uses available`);
			return {};
		}

		// check the weapon attack type
		if (!["martialM", "martialR", "simpleM", "simpleR"].includes(lastArg.itemData.system.weaponType)) {
			console.log(`${optionName} - not eligible attack`);
			return {};
		}

		// ask if they want to use the option
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `${optionName}`,
				content: `<p>Add ${optionName} damage to this attack?</p>`,
				buttons: {
					one: {
						icon: '<p> </p><img src = "icons/creatures/mammals/bull-horned-blue.webp" width="50" height="50"></>',
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
			// reduce uses
			await featureItem.update({"system.uses.value": uses - 1});
			
			// return damage bonus
			let damageParts = lastArg.item.system.damage.parts;
			let damageDie = damageParts[0][0].trim();
			
			// strip off any kind of bonus
			let index = damageDie.indexOf(" ");
			if (index) {
				damageDie = damageDie.substring(0, index);
			}
			index = damageDie.indexOf("+");
			if (index > 0) {
				damageDie = damageDie.substring(0, index);
			}
			
			// strip off damage flavor
			index = damageDie.indexOf("[");
			if (index > 0) {
				damageDie = damageDie.substring(0, index);
			}
			
			const damageType = damageParts[0][1];
			return {damageRoll: `${damageDie}`, flavor: optionName};
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
