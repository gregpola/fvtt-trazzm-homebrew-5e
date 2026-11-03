/**
 * Make sure the damage activity is only once per turn
 */
const optionName = "Grave Ground";
const version = "14.5.0";
const timeFlag = "grave-ground-time";

try {
    if (args[0].macroPass === "preItemRoll") {
        // Check for availability i.e. once per actors turn
        let ttoken = workflow.targets.first();
        //if (!game.combat || !HomebrewHelpers.isOwnTurn(ttoken) || !HomebrewHelpers.isAvailableThisTurn(ttoken.actor, timeFlag)) {
        if (!HomebrewHelpers.isAvailableThisTurn(ttoken.actor, timeFlag)) {
            console.warn(`${optionName}: is not available this turn`);
            return false;
        }
    }
    else if (args[0].macroPass === "postActiveEffects") {
        for (let targetToken of workflow.targets) {
            await HomebrewHelpers.setUsedThisTurn(targetToken.actor, timeFlag);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
