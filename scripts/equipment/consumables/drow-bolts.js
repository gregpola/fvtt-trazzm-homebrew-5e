/*
    This poison is typically made only by the drow, and only in a place far removed from sunlight. A creature subjected
    to this poison must succeed on a DC 13 Constitution saving throw or be poisoned for 1 hour. If the saving throw
    fails by 5 or more, the creature is also unconscious while poisoned in this way. The creature wakes up if it takes
    damage or if another creature takes an action to shake it awake.
*/
const version = "12.4.0";
const optionName = "Drow Bolts";
const saveDC = 13;

try {
    if (args[0].macroPass === "postActiveEffects") {
        let targetToken = workflow.hitTargets.first();
        if (targetToken) {
            const hasResilience = HomebrewHelpers.hasResilience(targetToken.actor, "poison");
            let saveRoll = await targetToken.actor.rollAbilitySave("con", {
                flavor: `${CONFIG.DND5E.abilities["con"].label} DC${saveDC} ${optionName}`,
                advantage : hasResilience
            });

            if (saveRoll.total < saveDC) {
                await HomebrewEffects.applyPoisonedEffect2024(targetToken.actor, macroItem, ['shortRest', 'longRest'], 3600);

                if (saveRoll.total <= (saveDC - 5)) {
                    await HomebrewEffects.applySleepingEffect2024(targetToken.actor, macroItem, undefined, 3600);
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
