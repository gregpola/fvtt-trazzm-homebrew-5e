const version = "12.4.0";
const optionName = "Drow Hand Crossbow Poisoon";
const saveDC = 13;

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postDamageRoll") {
        // request the saving throw
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
