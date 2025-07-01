/*
    When a creature you can see attacks a target other than you that is within 5 feet of you, you can take a Reaction to
    interpose your Shield if you’re holding one. You impose Disadvantage on the triggering attack roll and all other
    attack rolls against the target until the start of your next turn if you remain within 5 feet of the target.
*/
const optionName = "Protection";
const version = "12.4.0";

try {
    if (args[0].tag === "TargetOnUse" && args[0].macroPass === "isAttacked") {
        const sourceActor = macroItem.parent;
        const hasUsedReaction = MidiQOL.hasUsedReaction(sourceActor);

        if (!hasUsedReaction) {
            // Trigger the activity for the source player
            let browserUser = MidiQOL.playerForActor(sourceActor);
            if (!browserUser?.active) {
                console.info(`${optionName} - unable to locate the actor player, sending to GM`);
                browserUser = game.users?.activeGM;
            }

            let activity = macroItem.system.activities.getName("Protect Target");
            if (activity) {
                const options = {
                    midiOptions: {
                        targetsToUse: workflow.targets,
                        asUser: browserUser,
                        noOnUseMacro: false,
                        configureDialog: true,
                        showFullCard: false,
                        ignoreUserTargets: false,
                        checkGMStatus: true,
                        autoRollAttack: false,
                        autoRollDamage: "always",
                        fastForwardAttack: false,
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
