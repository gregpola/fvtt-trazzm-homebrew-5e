/*
    Heated Body: When donning this armor, any adversary within 5 feet who successfully attacks or touches the wearer
    will suffer 1d6 fire damage.

    This damage increases by 1d6 when you reach 5th level (2d6), 9th level (3d6), 13th level (4d6), and 17th level (5d6).
*/
const version = "13.5.0";
const optionName = "Polar Worm Scales";

try {
    if (args[0].tag === "TargetOnUse" && args[0].macroPass === "isHit") {
        // get the attacker to check the distance and mwak or msak
        if (["mwak", "msak"].includes(rolledActivity.actionType)) {
            const attacker = rolledItem.actor;
            const attackerToken = MidiQOL.tokenForActor(attacker);
            if (MidiQOL.computeDistance(attackerToken, token) <= 5) {
                // replace with activity use
                let activity = await macroItem.system.activities.find(a => a.identifier === 'heated-body');
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