/*
	If you make an attack roll for a spell and miss, you can spend 2 sorcery points to reroll the d20, and you must use the new roll.

	You can use Seeking Spell even if you have already used a different Metamagic option during the casting of the spell.
*/
const version = "11.1";
const optionName = "Seeking Spell";
const cost = 2;

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
    console.error(`${optionName}: ${version}`, err);
}
