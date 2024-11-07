const version = "12.3.0";
const optionName = "Pounce";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let targetToken = workflow.failedSaves.first();
        if (targetToken) {
            await HomebrewEffects.applyProneEffect(targetToken.actor, item.uuid);
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
