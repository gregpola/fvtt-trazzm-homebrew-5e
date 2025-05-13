/*
    If you hit a creature with this weapon, that creature has Disadvantage on its next attack roll before the start of
    your next turn.
*/
const optionName = "Weapon Mastery: Sap";
const version = "12.4.0";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postAttackRoll") {
        let targetToken = workflow.hitTargets.first();
        if (targetToken && item.type === 'weapon' && item.system.mastery === 'sap' && HomebrewHelpers.hasMastery(actor, item)) {
            if (macroItem) {
                let activity = macroItem.system.activities.getName("Sap");
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
