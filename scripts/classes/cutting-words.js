/*
	Also at 3rd level, you learn how to use your wit to distract, confuse, and otherwise sap the confidence and competence
	of others. When a creature that you can see within 60 feet of you makes an attack roll, an ability check, or a damage
	roll, you can use your reaction to expend one of your uses of Bardic Inspiration, rolling a Bardic Inspiration die
	and subtracting the number rolled from the creature’s roll. You can choose to use this feature after the creature
	makes its roll, but before the DM determines whether the attack roll or ability check succeeds or fails, or before
	the creature deals its damage. The creature is immune if it can’t hear you or if it’s immune to being Charmed.
 */
const version = "11.0";
const resourceName = "Bardic Inspiration";
const optionName = "Cutting Words";
const cost = 1;

try {
	if (args[0].macroPass === "preItemRoll") {
		let target = workflow.targets?.first();

		if (target) {
			// check resources
			let inspirationUses = actor.items.find(i => i.name === resourceName);
			if (inspirationUses) {
				let usesLeft = inspirationUses.system.uses?.value ?? 0;
				if (!usesLeft || usesLeft < cost) {
					console.error(`${optionName} - not enough ${resourceName} uses left`);
					ui.notifications.error(`${optionName} - not enough ${resourceName} uses left`);
					return false;

				} else {
					const newValue = inspirationUses.system.uses.value - cost;
					await inspirationUses.update({"system.uses.value": newValue});
				}

			} else {
				console.error(`${optionName} - no ${resourceName} item on actor`);
				ui.notifications.error(`${optionName} - no ${resourceName} item on actor`);
				return false;
			}

			// get the actor scale value
			const inspirationDie = actor.system.scale.bard["inspiration"];
			const cuttingWordsRoll = await new Roll(`${inspirationDie}`).evaluate({async: true});
			if (game.dice3d) game.dice3d.showForRoll(cuttingWordsRoll);
			ChatMessage.create({content: `${optionName} - ${actor.name} applies cutting words debuff of ${cuttingWordsRoll.total} to ${target.name}`});
			return true;
		}
		else {
			return false;
		}
	}
	
} catch (err)  {
    console.error(`${optionName} ${version}`, err);
}
