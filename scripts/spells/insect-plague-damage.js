/*
    Swarming locusts fill a 20-foot-radius Sphere centered on a point you choose within range. The Sphere remains for
    the duration, and its area is Lightly Obscured and Difficult Terrain.

    When the swarm appears, each creature in it makes a Constitution saving throw, taking 4d10 Piercing damage on a
    failed save or half as much damage on a successful one. A creature also makes this save when it enters the spell’s
    area for the first time on a turn or ends its turn there. A creature makes this save only once per turn.

    Using a Higher-Level Spell Slot.The damage increases by 1d10 for each spell slot level above 5.
*/
const version = "12.4.1";
const optionName = "Insect Plague";
const _flagGroup = "fvtt-trazzm-homebrew-5e";

// the enter or end turn damage macro
const combatTime = game.combat ? `${game.combat.id}-${game.combat.round + game.combat.turn / 100}` : 1;
let targetToken = event.data.token;
if (targetToken) {
    const originActor = await fromUuid(region.flags['region-attacher'].actorUuid);
    const sourceItem = await fromUuid(region.flags['region-attacher'].itemUuid);

    let targetCombatant = game.combat.getCombatantByToken(targetToken);
    if (targetCombatant) {
        const flagName = `insect-plague-${originActor.id}`;
        if (HomebrewHelpers.perTurnCheck(targetCombatant, flagName, event.name)) {
            // synthetic activity use
            const activity = sourceItem.system.activities.find(a => a.identifier === 'insect-plague-damage');
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
                let activityUse = await MidiQOL.completeActivityUse(activity.uuid, options, {}, {});
            }
        }
    }
}
