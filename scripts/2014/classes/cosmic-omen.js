/*
	Whenever you finish a long rest, you can consult your Star Map for omens. When you do so, roll a die. Until you
	finish your next long rest, you gain access to a special reaction based on whether you rolled an even or an odd
	number on the die:

	  Weal (even). Whenever a creature you can see within 30 feet of you is about to make an attack roll, a saving throw,
	  	or an ability check, you can use your reaction to roll a d6 and add the number rolled to the total.

	  Woe (odd). Whenever a creature you can see within 30 feet of you is about to make an attack roll, a saving throw,
	  	or an ability check, you can use your reaction to roll a d6 and subtract the number rolled from the total.

	You can use this reaction a number of times equal to your proficiency bonus, and you regain all expended uses when you finish a long rest.
*/
const version = "12.3.0";
const optionName = "Cosmic Omen";

const wealItemName = "Cosmic Omen - Weal";
const wealItemId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-items.Item.TqctgQP34LHPOeAi";
const woeItemName = "Cosmic Omen - Woe";
const woeItemId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-items.Item.5t0Z8OYoYmdRPMtc";

try {
	if (args[0] === "on") {
		await removeItems();

		// roll a die to determine which omen is received
		let roll = await new Roll('1d20').evaluate();
		await game.dice3d?.showForRoll(roll);

		// add the omen
		let favoriteItem;
		if ((roll.total % 2) === 0) {
			let wealItem = await fromUuid(wealItemId);
			await actor.createEmbeddedDocuments('Item',[wealItem]);
			favoriteItem = actor.items.find(i => i.name === wealItemName);
			if (favoriteItem) {
				await HomebrewHelpers.addFavorite(actor, favoriteItem);
			}
		}
		else {
			let woeItem = await fromUuid(woeItemId);
			await actor.createEmbeddedDocuments('Item',[woeItem]);
			favoriteItem = actor.items.find(i => i.name === woeItemName);
			if (favoriteItem) {
				await HomebrewHelpers.addFavorite(actor, favoriteItem);
			}
		}
	}
	else if (args[0] === "off") {
		await removeItems();
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function removeItems() {
	const wealItem = actor.items.find(i => i.name === wealItemName);
	if (wealItem) {
		await actor.deleteEmbeddedDocuments('Item', [wealItem.id]);
	}

	const woeItem = actor.items.find(i => i.name === woeItemName);
	if (woeItem) {
		await actor.deleteEmbeddedDocuments('Item', [woeItem.id]);
	}
}
