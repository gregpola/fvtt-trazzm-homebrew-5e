const version = "12.3.0";
const optionName = "Totemic Attunement - Elk";

try {
	if (args[0].macroPass === "preItemRoll") {
		const targetToken = workflow.targets.first();
		
		// make sure the actor is raging
		let rageEffect = HomebrewHelpers.findEffect(actor, "Rage");
		if (!rageEffect) {
			ui.notifications.error(`${optionName}: actor must be raging`);
			return false;
		}
		
		// make sure the target is large or smaller
		const tsize = targetToken.actor.system.traits.size;
		if (!["tiny","sm","med","lg"].includes(tsize)) {
			ui.notifications.error(`${optionName}: target is too large to trip`);
			return false;
		}

		return true;
	}

} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
