/*
    If you hit a creature with this weapon and deal damage to it, you can reduce its Speed by 10 feet until the start of
    your next turn. If the creature is hit more than once by weapons that have this property, the Speed reduction
    doesn’t exceed 10 feet.
*/
const optionName = "Weapon Mastery: Slow";
const version = "12.4.0";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postAttackRoll") {
        let targetToken = workflow.hitTargets.first();
        if (targetToken && item.type === 'weapon' && item.system.mastery === 'slow' && HomebrewHelpers.hasMastery(actor, item)) {
            if (macroItem) {
                let activity = macroItem.system.activities.getName("Slow");
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

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
