const version = "12.3.0";
const optionName = "Bite";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let targetToken = workflow.hitTargets.first();
        if (targetToken) {
            await HomebrewMacros.applyGrappled(token, targetToken, item, 22, undefined, true);
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
