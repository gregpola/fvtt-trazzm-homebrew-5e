/*
    Protective magical frost surrounds you. You gain 5 Temporary Hit Points. If a creature hits you with a melee attack
    roll before the spell ends, the creature takes 5 Cold damage. The spell ends early if you have no Temporary Hit Points.
*/
const optionName = "Armor of Agathys";
const version = "14.5.0";

try {
    if (args[0].tag === "TargetOnUse" && args[0].macroPass === "isHit") {
        if (["mwak", "msak"].includes(rolledActivity.actionType)) {
            const attacker = rolledItem.actor;
            const attackerToken = MidiQOL.tokenForActor(attacker);

            const activity = macroItem.system.activities.find(a => a.identifier === 'frost-damage');
            if (activity) {
                // get the actor owner
                let actorUser = MidiQOL.playerForActor(actor);
                if (!actorUser?.active) {
                    console.info(`${optionName} - unable to locate the actor player, sending to GM`);
                    actorUser = game.users?.activeGM;
                }

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
    else if (args[0].tag === "TargetOnUse" && args[0].macroPass === "preTargetDamageApplication") {
        // check for expiration
        if (workflow.damageItem.newTempHP <= 0) {
            await HomebrewEffects.removeEffectByName(actor, optionName);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
