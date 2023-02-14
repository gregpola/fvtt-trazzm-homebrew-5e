const version = "10.0.0";
const optionName = "Dagger of Venom";
const flagName = "dagger-of-venom";

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);
	
	if (args[0].macroPass === "preItemRoll") {
		// find the actor's items that can be poisoned
		// must be piercing or slashing
		let weapons = actor.items.filter(i => i.type === `weapon` && i.name === optionName);
		if (!weapons || weapons.length < 1) {
			ui.notifications.error(`${optionName} - not found on actor`);
			return false;
		}		
	}
	else if (args[0].macroPass === "postActiveEffects") {
		let weapons = actor.items.filter(i => i.type === `weapon` && i.name === optionName);

		for (let weapon of weapons) {
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
			await warpgate.mutate(actorToken.document, updates, {}, { name: itemName });
			await DAE.setFlag(actor, flagName, {itemName: itemName, itemId: weapon.id } );
			ChatMessage.create({content: itemName + " is coated with poison"});
		}
	}
	
} catch (err) {
	console.error(`${optionName} - ${version}`, err);
}
