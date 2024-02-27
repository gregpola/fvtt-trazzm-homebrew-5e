/*
	When you cast a spell that forces a creature to make a saving throw to resist its effects, you can spend 3 sorcery
	points to give one target of the spell disadvantage on its first saving throw made against the spell.
*/
const version = "11.1";
const optionName = "Heightened Spell";
const cost = 3;

try {
	if (args[0].macroPass === "preItemRoll") {
		let usesLeft = HomebrewHelpers.getAvailableSorceryPoints(actor);
		if (!usesLeft || usesLeft < cost) {
			console.error(`${optionName} - not enough Sorcery Points left`);
			ui.notifications.error(`${optionName} - not enough Sorcery Points left`);
			return false;
		}

		await HomebrewHelpers.reduceAvailableSorceryPoints(actor, cost)
		return true;
	}
	
} catch (err)  {
    console.error(`${optionName} : ${version}`, err);
}
