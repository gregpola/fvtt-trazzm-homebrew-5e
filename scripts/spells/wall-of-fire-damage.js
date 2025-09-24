/*
    You create a wall of fire on a solid surface within range. You can make the wall up to 60 feet long, 20 feet high,
    and 1 foot thick, or a ringed wall up to 20 feet in diameter, 20 feet high, and 1 foot thick. The wall is opaque and
    lasts for the duration.

    One side of the wall, selected by you when you cast this spell, deals 5d8 Fire damage to each creature that ends its
    turn within 10 feet of that side or inside the wall. A creature takes the same damage when it enters the wall for
    the first time on a turn or ends its turn there. The other side of the wall deals no damage.
*/
const version = "13.5.0";
const optionName = "Wall of Fire";

// the enter or end turn macro
let targetToken = event.data.token;
if (targetToken) {
    const tflags = region.flags['region-attacher'];

    if (tflags && tflags.itemUuid) {
        const sourceItem = await fromUuid(tflags.itemUuid);
        if (sourceItem) {
            let targetCombatant = game.combat.getCombatantByToken(targetToken);
            if (targetCombatant) {
                const originActor = sourceItem.parent;
                const flagName = `walloffire-${originActor.id}`;
                if (HomebrewHelpers.perTurnCheck(targetCombatant, flagName, event.name)) {
                    // synthetic activity use
                    const activity = sourceItem.system.activities.find(a => a.identifier === 'wall-damage');
                    if (activity) {
                        await HomebrewHelpers.setTurnCheck(targetCombatant, flagName);

                        const options = {
                            midiOptions: {
                                targetsToUse: new Set([targetToken]),
                                noOnUseMacro: false,
                                configureDialog: false,
                                showFullCard: false,
                                ignoreUserTargets: true,
                                checkGMStatus: true,
                                autoRollAttack: true,
                                autoRollDamage: "always",
                                fastForwardAttack: true,
                                fastForwardDamage: true,
                                workflowData: false
                            }
                        };

                        await MidiQOL.completeActivityUse(activity.uuid, options, {}, {});
                    }
                }
            }
        }
    }
}
