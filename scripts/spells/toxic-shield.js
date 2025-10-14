/*
    You gain resistance to poison damage and advantage on saves against being poisoned for the duration. In addition,
    whenever a creature within 5 feet of you hits you with a melee attack, the shield sprays them with poison, dealing
    1d8 poison damage to the attacker.

    At Higher Levels. When you cast this spell using a spell slot of 2nd level or higher, the poison damage increases by
    1d8 for every 2 slot levels above 1st.
*/
const optionName = "Toxic Shield";
const version = "13.5.0";

try {
    if (args[0].tag === "TargetOnUse" && args[0].macroPass === "isHit") {
        // get the attacker to check the distance and mwak or msak
        if (["mwak", "msak"].includes(macroActivity.actionType)) {
            const attacker = rolledItem.actor;
            const attackerToken = MidiQOL.tokenForActor(attacker);

            let activity = macroItem.system.activities.find(a => a.identifier === 'poison-damage');
            if (activity) {
                const options = {
                    midiOptions: {
                        targetsToUse: new Set([attackerToken]),
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

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
