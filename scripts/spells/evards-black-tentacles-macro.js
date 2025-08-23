/*
    Squirming, ebony tentacles fill a 20-foot square on ground that you can see within range. For the duration, these
    tentacles turn the ground in that area into Difficult Terrain.

    Each creature in that area makes a Strength saving throw. On a failed save, it takes 3d6 Bludgeoning damage, and it
    has the Restrained condition until the spell ends. A creature also makes that save if it enters the area or ends it
    turn there. A creature makes that save only once per turn.

    A Restrained creature can take an action to make a Strength (Athletics) check against your spell save DC, ending the
    condition on itself on a success.
*/
const optionName = "Evard's Black Tentacles";
const version = "12.4.0";
const restrainedEffectName = "Restrained by Tentacles";
const inEffectName = "In Evard's Black Tentacles";

try {
    let targetToken = event.data.token;
    if (targetToken) {
        const sourceItem = await fromUuid(region.flags['region-attacher'].itemUuid);

        if (event.name === 'tokenExit') {
            await HomebrewEffects.removeEffectByName(targetToken.actor, restrainedEffectName);
            await HomebrewEffects.removeEffectByName(targetToken.actor, inEffectName);
        }
        else {
            // the enter or end turn macro
            const originActor = await fromUuid(region.flags['region-attacher'].actorUuid);

            let targetCombatant = game.combat.getCombatantByToken(targetToken);
            if (targetCombatant) {
                const flagName = `black-tentacles-${originActor.id}`;
                if (HomebrewHelpers.perTurnCheck(targetCombatant, flagName, event.name)) {
                    // synthetic activity use
                    const activity = sourceItem.system.activities.find(a => a.identifier === 'black-tentacle-damage');
                    if (activity) {
                        await HomebrewHelpers.setTurnCheck(targetCombatant, flagName);
                        let targetUuids = [targetToken.uuid];

                        const options = {
                            midiOptions: {
                                targetUuids: targetUuids,
                                noOnUseMacro: true,
                                configureDialog: false,
                                showFullCard: false,
                                ignoreUserTargets: true,
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
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
