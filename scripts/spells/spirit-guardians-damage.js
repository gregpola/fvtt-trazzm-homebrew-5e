/*
    When you cast this spell, you can designate creatures to be unaffected by it. Any other creature’s Speed is halved
    in the Emanation, and whenever the Emanation enters a creature’s space and whenever a creature enters the Emanation
    or ends its turn there, the creature must make a Wisdom saving throw. On a failed save, the creature takes 3d8
    Radiant damage (if you are good or neutral) or 3d8 Necrotic damage (if you are evil). On a successful save, the
    creature takes half as much damage. A creature makes this save only once per turn.

    Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 3.
 */
const optionName = "Spirit Guardians";
const version = "12.4.0";
const _flagGroup = "fvtt-trazzm-homebrew-5e";

// once per turn damage
// only during 'on' phase
if (args[0] !== 'off') {
    let targetToken;
    let originActor;
    let sourceItem;
    let eventName = 'tokenEnter';

    if ((typeof midiData !== 'undefined') && midiData.workflowOptions && midiData.workflowOptions.isOverTime) {
        targetToken = workflow.effectTargets.first().document;
        originActor = actor;
        sourceItem = originActor.items.find(i => i.name === optionName && i.type === 'spell');
        eventName = 'tokenTurnEnd';

    }
    else if (lastArgValue && lastArgValue.tokenUuid) {
        targetToken = await fromUuid(lastArgValue.tokenUuid);
        originActor = await fromUuid(lastArgValue.origin);
        const castData = lastArgValue.efData.flags['midi-qol'].castData;
        sourceItem = await fromUuid(castData.itemUuid);

    }

    if (targetToken) {
        let targetCombatant = game.combat.getCombatantByToken(targetToken);
        if (targetCombatant) {
            const flagName = `spirit-guardians-${originActor.id}`;
            if (HomebrewHelpers.perTurnCheck(targetCombatant, flagName, eventName)) {
                // synthetic activity use
                const activity = sourceItem.system.activities.find(a => a.identifier === 'apply-damage');
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
}
