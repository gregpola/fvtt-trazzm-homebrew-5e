const optionName = "Book of Fates";
const version = "13.5.0";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postActiveEffects") {
        // entering rage?
        if (item.name === 'Rage') {
            let activity = await macroItem.system.activities.find(a => a.identifier === 'starforged-heal');
            if (activity) {
                const options = {
                    midiOptions: {
                        targetUuids: [actor.uuid],
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
