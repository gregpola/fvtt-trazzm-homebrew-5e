/**
 * The target must succeed on a Strength or Dexterity saving throw (it chooses which), or you either push it 5 feet away
 * or cause it to have the Prone condition. The DC for the saving throw equals 8 plus your Strength modifier and
 * Proficiency Bonus. This shove is possible only if the target is no more than one size larger than you.
 */
const optionName = "Unarmed Strike - Shove";
const version = "14.5.0";

try {
    if (args[0].macroPass === "preItemRoll") {
        const target = workflow.targets.first();
        if (target && !HomebrewHelpers.isSizeEligibleForGrapple(token, target)) {
            return false;
        }
    }
    else if (args[0].macroPass === "postActiveEffects") {
        const targetToken = workflow.failedSaves.first();
        if (targetToken) {
            await HomebrewMacros.pushTarget(token, targetToken, 1);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
