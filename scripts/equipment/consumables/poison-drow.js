/*
    This poison is typically made only by the drow, and only in a place far removed from sunlight. A creature subjected
    to this poison must succeed on a DC 13 Constitution saving throw or be poisoned for 1 hour. If the saving throw
    fails by 5 or more, the creature is also unconscious while poisoned in this way. The creature wakes up if it takes
    damage or if another creature takes an action to shake it awake.
*/
const version = "12.4.0";
const optionName = "Poison, Drow";
const coatedName = "Drow Poisoned";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _usesFlag = "coating-uses";
const maxUses = 3; // for ammunition
const saveDC = 13;

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postDamageRoll") {
        let coatedEffect = rolledItem.effects.find(e => e.name === coatedName && e.type === 'enchantment');
        if (coatedEffect) {
            let expireCoating = true;

            // check for ammo
            if (rolledItem.system.properties.has('amm')) {
                let flag = coatedEffect.getFlag(_flagGroup, _usesFlag);
                if (flag) {
                    if (flag < (maxUses - 1)) {
                        await coatedEffect.setFlag(_flagGroup, _usesFlag, flag + 1);
                        expireCoating = false;
                    }
                }
                else {
                    await coatedEffect.setFlag(_flagGroup, _usesFlag, 1);
                    expireCoating = false;
                }
            }

            if (expireCoating) {
                await rolledItem.deleteEmbeddedDocuments("ActiveEffect", [coatedEffect.id]);
            }

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
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
