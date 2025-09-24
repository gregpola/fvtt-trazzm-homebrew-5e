/*
    You create a 20-foot-radius Sphere of yellow-green fog centered on a point within range. The fog lasts for the
    duration or until strong wind (such as the one created by Gust of Wind) disperses it, ending the spell. Its area is
    Heavily Obscured.

    Each creature in the Sphere makes a Constitution saving throw, taking 5d8 Poison damage on a failed save or half as
    much damage on a successful one. A creature must also make this save when the Sphere moves into its space and when
    it enters the Sphere or ends its turn there. A creature makes this save only once per turn.

    The Sphere moves 10 feet away from you at the start of each of your turns.
 */
const version = "13.5.0";
const optionName = "Cloudkill";
const _flagGroup = "fvtt-trazzm-homebrew-5e";

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
                const flagName = `cloudkill-${originActor.id}`;
                if (HomebrewHelpers.perTurnCheck(targetCombatant, flagName, event.name)) {
                    // synthetic activity use
                    const activity = sourceItem.system.activities.find(a => a.identifier === 'cloudkill-damage');
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
