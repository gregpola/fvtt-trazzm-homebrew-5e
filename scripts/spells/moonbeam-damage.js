/*
    A silvery beam of pale light shines down in a 5-foot-radius, 40-foot-high Cylinder centered on a point within range.
    Until the spell ends, Dim Light fills the Cylinder, and you can take a Magic action on later turns to move the
    Cylinder up to 60 feet.

    When the Cylinder appears, each creature in it makes a Constitution saving throw. On a failed save, a creature takes
    2d10 Radiant damage, and if the creature is shape-shifted (as a result of the Polymorph spell, for example), it
    reverts to its true form and can’t shape-shift until it leaves the Cylinder. On a successful save, a creature takes
    half as much damage only. A creature also makes this save when the spell’s area moves into its space and when it
    enters the spell’s area or ends its turn there. A creature makes this save only once per turn.

    Using a Higher-Level Spell Slot.The damage increases by 1d10 for each spell slot level above 2.
 */
const optionName = "Moonbeam";
const version = "12.4.1";
const _flagGroup = "fvtt-trazzm-homebrew-5e";

// the enter or end turn macro
const combatTime = game.combat ? `${game.combat.id}-${game.combat.round + game.combat.turn / 100}` : 1;
let targetToken = event.data.token;
if (targetToken) {
    const originActor = await fromUuid(region.flags['region-attacher'].actorUuid);
    const sourceItem = await fromUuid(region.flags['region-attacher'].itemUuid);

    let targetCombatant = game.combat.getCombatantByToken(targetToken);
    if (targetCombatant) {
        const flagName = `moonbeam-${originActor.id}`;
        if (HomebrewHelpers.perTurnCheck(targetCombatant, flagName, event.name)) {
            // synthetic activity use
            const activity = sourceItem.system.activities.find(a => a.identifier === 'moonbeam-damage');
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
