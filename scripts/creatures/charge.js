const version = "12.3";
const optionName = "Charge";

try {
    if (args[0].macroPass === "preItemRoll") {
        let targetToken = workflow?.targets?.first();
        if (targetToken) {
            return await HomebrewMacros.chargeTarget(token, targetToken, 20);
        }

        return true;
    }
    else if (args[0].macroPass === "postActiveEffects") {
        let targetToken = workflow?.failedSaves?.first();
        if (targetToken) {
            await HomebrewEffects.applyProneEffect(targetToken.actor, item);
        }
    }
} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}
