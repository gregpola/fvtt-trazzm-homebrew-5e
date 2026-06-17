const version = "14.5.0";
const optionName = "Moist";

try {
    if (args[0].tag === "TargetOnUse" && args[0].macroPass === "isHit") {
        // get the attacker to check the distance and mwak or msak
        if (["mwak", "msak", "rwak", "rsak"].includes(rolledActivity.actionType)) {
            const attacker = rolledItem.actor;
            const attackerToken = MidiQOL.tokenForActor(attacker);
            if (MidiQOL.computeDistance(attackerToken, token) <= 10) {
                // replace with activity use
                let activity = await macroItem.system.activities.find(a => a.identifier === 'acid-damage');
                if (activity) {
                    const options = {
                        midiOptions: {
                            targetUuids: [attacker.uuid],
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

                    MidiQOL.completeActivityUse(activity, options, {}, {});
                }
            }
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}