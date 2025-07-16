/*
    When you use the sword to attack a target that is in dim light or darkness, you make the attack roll with advantage.
 */
const version = "12.4.0";
const optionName = "Shadow Blade - Advantage";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "preAttackRoll") {
        const targetToken = workflow.targets.first();
        if (targetToken) {
            const tokenLightLevel = HomebrewHelpers.getLightLevel(targetToken);
            if (tokenLightLevel !== 'bright') {
                workflow.advantage = true;
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
