/*
	Basilisk Oil is a Consumable (Potion). When applied to a creature, it restores a petrified creature back to its organic form.
*/
const optionName = "Basilisk Oil";
const version = "12.4.0";

try {
    const targetToken = workflow.targets.first();

    if (args[0].macroPass === "preItemRoll") {
        if (targetToken && targetToken.actor.statuses.has("petrified")) {
            return true;
        }

        ui.notifications.error(`${optionName}: ${version} - no target or not petrified`);
        return false;
    }
    else if (args[0].macroPass === "postActiveEffects") {
        await targetToken.actor.toggleStatusEffect('petrified', {active: false});
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
