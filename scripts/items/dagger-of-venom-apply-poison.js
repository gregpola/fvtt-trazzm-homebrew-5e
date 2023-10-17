const version = "11.0";
const optionName = "Dagger of Venom";
const flagName = "dagger-of-venom";

try {
	if (args[0].macroPass === "preItemRoll") {
		let weapons = actor.items.filter(i => i.type === `weapon` && i.name === optionName && i.flags?.magicitems?.feats[0]?.id === item.id);
		if (!weapons || weapons.length < 1) {
			ui.notifications.error(`${optionName} - not found on actor`);
			return false;
		}		
	}
	else if (args[0].macroPass === "postActiveEffects") {
		let weapon = actor.items.find(i => i.type === `weapon` && i.name === optionName && i.flags?.magicitems?.feats[0]?.id === item.id);
		if (weapon) {
			const itemName = weapon.name;

			let mutations = {};
			mutations[weapon.name] = {
				"name": `${weapon.name} (coated)`,
			};

			const updates = {
				embedded: {
					Item: mutations
				}
			};

			// mutate the selected item
			await warpgate.mutate(token.document, updates, {}, { name: itemName });
			await DAE.setFlag(actor, flagName, {itemName: itemName, itemId: weapon.id } );
			ChatMessage.create({content: itemName + " is coated with poison"});
		}
	}
	
} catch (err) {
	console.error(`${optionName} - ${version}`, err);
}
