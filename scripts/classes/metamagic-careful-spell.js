/*
	When you cast a spell that forces other creatures to make a saving throw, you can protect some of those creatures
	from the spell's full force. To do so, you spend 1 sorcery point and choose a number of those creatures up to your
	Charisma modifier (minimum of one creature). A chosen creature automatically succeeds on its saving throw against the spell.
*/
const version = "11.0";
const optionName = "Careful Spell";
const baseName = "Font of Magic";
const cost = 1;

try {
	if (args[0].macroPass === "preItemRoll") {
		// check max targets
		let maxTargets = Math.max(actor.system.abilities.cha.mod, 1);
		if (workflow.preSelectedTargets.length > maxTargets) {
			ui.notifications.error(`${optionName} - too many targets selected to protect`);
			return false;
		}

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
