/*
	When you cast a spell that forces a creature to make a saving throw to resist its effects, you can spend 3 sorcery
	points to give one target of the spell disadvantage on its first saving throw made against the spell.
*/
const version = "11.0";
const optionName = "Heightened Spell";
const baseName = "Font of Magic";
const cost = 3;

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
