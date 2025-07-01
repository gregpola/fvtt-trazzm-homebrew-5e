/*
    When you take damage from the target cursed by your Hexblade’s Curse, you can take a Reaction to reduce the damage
    taken by an amount equal to your Warlock level.
*/
const optionName = "Armor of Hexes";
const version = "12.4.1";
const effectName = "Hexblade's Curse";

try {
    if (args[0].macroPass === "preItemRoll") {
        let isHexed = false;
        const attackingActor = workflow.workflowOptions.item.actor;
        if (attackingActor) {
            isHexed = HomebrewHelpers.isHexed(attackingActor, workflow.workflowOptions.item.actor);
        }

        if (!isHexed) {
            ui.notifications.error(`${optionName}: ${version} - attacker is not hexed`);
            return false;
        }

    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
