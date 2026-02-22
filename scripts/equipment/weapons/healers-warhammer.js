/*
     Font of Life. If the warhammer is equipped, when you cast a healing spell (such as cure wounds), the mace gains a charge.
*/
const optionName = "Healer's Warhammer - Font of Life";
const version = "13.5.0";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postActiveEffects") {
        if (rolledItem.type === "spell" && rolledActivity.healing !== undefined) {
            // make sure it's source isn't the hammer
           if (rolledItem.system.linkedActivity?.item === macroItem) {
               console.log(`${optionName}: ${version} - Skipping recovery from hammer's healing spell.`);
               return;
           }

            let activity = await macroItem.system.activities.find(a => a.identifier === 'recover-charge');
            if (activity) {
                const options = {
                    midiOptions: {
                        targetUuids: [actor.uuid],
                        noOnUseMacro: true,
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
