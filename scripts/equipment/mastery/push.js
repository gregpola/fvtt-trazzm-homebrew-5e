/*
    If you hit a creature with this weapon, you can push the creature up to 10 feet straight away from yourself if it is
    Large or smaller.
*/
const optionName = "Weapon Mastery: Push";
const version = "12.4.0";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postDamageRoll") {
        let targetToken = workflow.hitTargets.first();
        if (targetToken && item.type === 'weapon' && item.system.mastery === 'push' && HomebrewHelpers.hasMastery(actor, item)) {
            if (HomebrewHelpers.isSizeEligibleForGrapple(token, targetToken)) {
                const proceed = await foundry.applications.api.DialogV2.confirm({
                    window: {
                        title: `${optionName}`,
                    },
                    content: `Do you want to push ${targetToken.name} 10 feet away?`,
                    rejectClose: false,
                    modal: true
                });

                if (proceed) {
                    if (macroItem) {
                        let activity = macroItem.system.activities.getName("Push");
                        if (activity) {
                            const options = {
                                midiOptions: {
                                    targetUuids: [targetToken.actor.uuid],
                                    noOnUseMacro: false,
                                    configureDialog: false,
                                    showFullCard: false,
                                    ignoreUserTargets: false,
                                    checkGMStatus: true,
                                    autoRollAttack: true,
                                    autoRollDamage: "always",
                                    fastForwardAttack: true,
                                    fastForwardDamage: true,
                                    workflowData: true
                                }
                            };

                            await MidiQOL.completeActivityUse(activity.uuid, options, {}, {});
                        }
                    }
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
