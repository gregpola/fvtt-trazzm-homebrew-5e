/*
    If the poison damage reduces the target to 0 hit points, the target is stable but poisoned for 1 hour, even after
    regaining hit points, and is paralyzed while poisoned in this way.
*/
const optionName = "Poison Needle";
const version = "13.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        for (let targetToken of workflow.hitTargets) {
            if (targetToken.actor.system.attributes.hp.value <= 0) {
                await targetToken.actor.toggleStatusEffect("poisoned", {active: true});
                await targetToken.actor.toggleStatusEffect("paralyzed", {active: true});
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
