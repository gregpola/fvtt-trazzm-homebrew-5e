/*
    When a creature that you can see within 30 feet of yourself makes an attack roll, you can take a Reaction to impose
    Disadvantage on the attack roll, causing light to flare before it hits or misses.
*/
const optionName = "Warding Flare";
const version = "12.4.0";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "preAttackRoll") {
        const sourceActor = macroItem.parent;
        const hasUsedReaction = MidiQOL.hasUsedReaction(sourceActor);

        if (!hasUsedReaction) {
            // Trigger the activity for the source player
            let browserUser = MidiQOL.playerForActor(sourceActor);
            if (!browserUser?.active) {
                console.info(`${optionName} - unable to locate the actor player, sending to GM`);
                browserUser = game.users?.activeGM;
            }

            let activity = macroItem.system.activities.getName("Interposing Flare");
            if (activity) {
                const options = {
                    midiOptions: {
                        targetsToUse: workflow.targets,
                        noOnUseMacro: false,
                        configureDialog: true,
                        showFullCard: false,
                        ignoreUserTargets: false,
                        checkGMStatus: true,
                        autoRollAttack: true,
                        autoRollDamage: "always",
                        fastForwardAttack: true,
                        fastForwardDamage: true,
                        workflowData: false
                    }
                };

                await MidiQOL.completeActivityUse(activity, options, {}, {});
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
