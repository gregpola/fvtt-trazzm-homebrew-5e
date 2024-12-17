/*
	When you take the Attack action on your turn, you can forgo one of your attacks and use a bonus action to direct one
	of your companions to strike. When you do so, choose a friendly creature who can see or hear you and expend one
	superiority die. That creature can immediately use its reaction to make one weapon attack, adding the superiority
	die to the attack’s damage roll.
 */
const version = "11.0";
const optionName = "Commander's Strike";
const featureName = "Superiority Dice";
const cost = 1;

try {
	if (args[0].macroPass === "preItemRoll") {
		// check for available uses
		let featureItem = actor.items.find(i => i.name === featureName);
		if (featureItem) {
			let usesLeft = featureItem.system.uses?.value ?? 0;
			if (!usesLeft || usesLeft < cost) {
				console.error(`${optionName} - not enough ${featureName} uses left`);
				ui.notifications.error(`${optionName} - not enough ${featureName} uses left`);
			}
			else {
				const newValue = featureItem.system.uses.value - cost;
				await featureItem.update({"system.uses.value": newValue});
				return true;
			}
		}
		else {
			console.error(`${optionName} - no ${featureName} item on actor`);
			ui.notifications.error(`${optionName} - no ${featureName} item on actor`);
		}

		ui.notifications.error(`${featureName} - feature not found`);
		return false;
	}

} catch (err) {
	console.error(`${optionName} - ${version}`, err);
}
