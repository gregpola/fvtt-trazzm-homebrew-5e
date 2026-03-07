/*
    You create a wall of whirling blades made of magical energy. The wall appears within range and lasts for the duration.
    You make a straight wall up to 100 feet long, 20 feet high, and 5 feet thick, or a ringed wall up to 60 feet in
    diameter, 20 feet high, and 5 feet thick. The wall provides Three-Quarters Cover, and its space is Difficult Terrain.

    Any creature in the wall’s space makes a Dexterity saving throw, taking 6d10 Force damage on a failed save or half
    as much damage on a successful one. A creature also makes that save if it enters the wall’s space or ends it's turn
    there. A creature makes that save only once per turn.
*/
const version = "13.5.0";
const optionName = "Blade Barrier";

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
                const flagName = `bladebarrier-${originActor.id}`;
                if (HomebrewHelpers.perTurnCheck(targetCombatant, flagName, event.name)) {
                    // synthetic activity use
                    const activity = sourceItem.system.activities.find(a => a.identifier === 'blade-barrier-damage');
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
