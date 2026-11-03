/**
 *  This macro filters out non-undead
 */
const optionName = "Turn Undead";
const version = "14.5.0";

try {
    if (args[0].macroPass === "preAoETargetConfirmation") {
        var changed = false;
        const newTargets = new Set();
        for (let targetToken of workflow.targets) {
            let undead = ["undead"].some(type => (targetToken.actor.system.details.type?.value || "").toLowerCase().includes(type));
            if (!undead) {
                changed = true;
            }
            else {
                newTargets.add(targetToken);
            }
        }

        if (changed) {
            await HomebrewHelpers.updateTargets(newTargets);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
