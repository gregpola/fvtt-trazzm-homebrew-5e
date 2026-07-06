/*
    Until the end of your next turn, any creature that hits the target with a melee attack roll takes Force damage equal to a roll of your Bardic Inspiration die.
*/
const optionName = "Avenger Spirit Shield";
const version = "14.5.0";

try {
    if (args[0].tag === "TargetOnUse" && args[0].macroPass === "isHit") {
        // get the attacker to check the distance and mwak or msak
        if (["mwak", "msak"].includes(rolledActivity.actionType)) {
            const attacker = rolledItem.actor;
            const attackerToken = MidiQOL.tokenForActor(attacker);
            if (MidiQOL.computeDistance(attackerToken, token) <= 5) {
                let activity = macroItem.system.activities.find(a => a.identifier === 'damage');

                // get the actor owner
                let actorUser = MidiQOL.playerForActor(actor);
                if (!actorUser?.active) {
                    console.info(`${optionName} - unable to locate the actor player, sending to GM`);
                    actorUser = game.users?.activeGM;
                }

                // synthetic activity use
                if (activity) {
                    let targets = new Set();
                    targets.add(attackerToken);

                    const options = {
                        midiOptions: {
                            targetsToUse: targets,
                            noOnUseMacro: true,
                            configureDialog: false,
                            showFullCard: true,
                            ignoreUserTargets: true,
                            checkGMStatus: true,
                            autoRollAttack: true,
                            autoRollDamage: "always",
                            fastForwardAttack: true,
                            fastForwardDamage: true,
                            asUser: actorUser.id,
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
