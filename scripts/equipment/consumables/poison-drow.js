/*
    This poison is typically made only by the drow, and only in a place far removed from sunlight. A creature subjected
    to this poison must succeed on a DC 13 Constitution saving throw or be poisoned for 1 hour. If the saving throw
    fails by 5 or more, the creature is also unconscious while poisoned in this way. The creature wakes up if it takes
    damage or if another creature takes an action to shake it awake.
*/
const version = "13.5.0";
const optionName = "Poison, Drow";
const coatedName = "Drow Poisoned";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _usesFlag = "coating-uses";
const maxUses = 3; // for ammunition
const saveDC = 13;
const activityId = "poison-save";

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
                if (macroItem) {
                    let activity = await macroItem.system.activities.find(a => a.identifier === activityId);
                    if (activity) {
                        const options = {
                            midiOptions: {
                                targetUuids: [targetToken.actor.uuid],
                                noOnUseMacro: false,
                                configureDialog: false,
                                showFullCard: false,
                                ignoreUserTargets: true,
                                checkGMStatus: false,
                                autoRollAttack: true,
                                autoRollDamage: "always",
                                fastForwardAttack: true,
                                fastForwardDamage: true,
                                workflowData: true
                            }
                        };


                        let result = await MidiQOL.completeActivityUse(activity, options, {}, {});
                        // if (result && (result.saveResults[0].total <= (result.saveDC - 5))) {
                        //     await HomebrewEffects.applySleepingEffect2024(targetToken.actor, macroItem, ['isDamaged', 'endCombat', 'longRest'], 3600);
                        // }
                    }
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
