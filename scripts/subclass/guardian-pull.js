/*
    In addition, when a Huge or smaller creature you can see ends its turn within 30 feet of you, you can take a
    Reaction to magically force that creature to make a Strength saving throw against your spell save DC. On a failed
    save, you pull the creature up to 25 feet directly toward you to an unoccupied space. If you pull the target to a
    space within 5 feet of yourself, you can make a melee weapon attack against it as part of this Reaction.
*/
const optionName = "Guardian - Pull Target";
const version = "14.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let targetToken = workflow.failedSaves.first();
        if (targetToken) {
            await HomebrewMacros.pullTargetTowardsSelf(token, targetToken, 30, optionName);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
