/*
	If you make an attack roll for a spell and miss, you can spend 2 sorcery points to reroll the d20, and you must use the new roll.

	You can use Seeking Spell even if you have already used a different Metamagic option during the casting of the spell.
*/
const version = "11.0";
const optionName = "Seeking Spell";
const baseName = "Font of Magic";
const cost = 2;

try {
	if (args[0].macroPass === "preItemRoll") {
		let fontOfMagic = actor.items.find(i => i.name === optionName);
		if (fontOfMagic) {
			let usesLeft = fontOfMagic.system.uses?.value ?? 0;
			if (!usesLeft || usesLeft < cost) {
				console.error(`${optionName} - not enough Sorcery Points left`);
				ui.notifications.error(`${optionName} - not enough Sorcery Points left`);
			}
			else {
				const newValue = fontOfMagic.system.uses.value - cost;
				await fontOfMagic.update({"system.uses.value": newValue});
				return true;
			}
		}
		else {
			console.error(`${optionName} - no ${baseName} item on actor`);
			ui.notifications.error(`${optionName} - no ${baseName} item on actor`);
		}

		return false;
	}
	
} catch (err)  {
    console.error(`Metamagic: ${optionName} ${version}`, err);
}
