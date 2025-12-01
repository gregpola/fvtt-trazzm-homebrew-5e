/*
    As a Bonus Action, you can apply a poison dose to a weapon or piece of ammunition. Once applied, the poison retains
    its potency for 1 minute or until you deal damage with the poisoned item, whichever is shorter. When a creature takes
    damage from the poisoned item, that creature must succeed on a Constitution saving throw (DC 8 plus the modifier of
    the ability increased by this feat and your Proficiency Bonus) or take 2d8 Poison damage and have the Poisoned
    condition until the end of your next turn.
 */
const version = "13.5.0";
const optionName = "Poisoner Poison";
const coatedName = "Poisoner Poisoned";
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
