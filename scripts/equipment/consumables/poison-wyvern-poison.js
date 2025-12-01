/*
    A creature subjected to Wyvern Poison makes a DC 14 Constitution saving throw, taking 24 (7d6) Poison damage on a
    failed save or half as much damage on a successful one
*/
const version = "13 .5.0";
const optionName = "Wyvern Poison";
const coatedName = "Wyvern Poisoned";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _usesFlag = "coating-uses";
const maxUses = 3; // for ammunition
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

                        await MidiQOL.completeActivityUse(activity, options, {}, {});
                    }
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
