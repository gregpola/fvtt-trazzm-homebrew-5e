/*
	You can spend 1 ki point to take the Dodge action as a bonus action on your turn.
 */
const version = "11.0";
const kiName = "Ki";
const optionName = "Patient Defense";
const cost = 1;

try {
	if (args[0].macroPass === "preItemRoll") {
		let kiFeature = actor.items.find(i => i.name === kiName);
		if (kiFeature) {
			let usesLeft = kiFeature.system.uses?.value ?? 0;
			if (!usesLeft || usesLeft < cost) {
				console.error(`${optionName} - not enough Ki left`);
				ui.notifications.error(`${optionName} - not enough Ki left`);
			}
			else {
				const newValue = kiFeature.system.uses.value - cost;
				await kiFeature.update({"system.uses.value": newValue});
				return true;
			}
		}
		else {
			console.error(`${optionName} - no ${kiName} item on actor`);
			ui.notifications.error(`${optionName} - no ${kiName} item on actor`);
		}

		return false;
	}

} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}
