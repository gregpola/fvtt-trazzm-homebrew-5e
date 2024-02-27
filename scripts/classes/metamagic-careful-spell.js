/*
	When you cast a spell that forces other creatures to make a saving throw, you can protect some of those creatures
	from the spell's full force. To do so, you spend 1 sorcery point and choose a number of those creatures up to your
	Charisma modifier (minimum of one creature). A chosen creature automatically succeeds on its saving throw against the spell.
*/
const version = "11.1";
const optionName = "Careful Spell";
const baseName = "Font of Magic";
const cost = 1;

try {
	if (args[0].macroPass === "preItemRoll") {
		let usesLeft = HomebrewHelpers.getAvailableSorceryPoints(actor);
		if (!usesLeft || usesLeft < cost) {
			console.error(`${optionName} - not enough Sorcery Points left`);
			ui.notifications.error(`${optionName} - not enough Sorcery Points left`);
			return false;
		}

		// check max targets
		let maxTargets = Math.max(actor.system.abilities.cha.mod, 1);
		if (workflow.preSelectedTargets.length > maxTargets) {
			ui.notifications.error(`${optionName} - too many targets selected to protect`);
			return false;
		}

		return true;
	}
	else if (args[0].macroPass === "postActiveEffects") {
		await HomebrewHelpers.reduceAvailableSorceryPoints(actor, cost)
	}
	
} catch (err)  {
	console.error(`${optionName}: ${version}`, err);
}
