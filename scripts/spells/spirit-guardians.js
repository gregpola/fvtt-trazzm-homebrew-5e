/*
    Protective spirits flit around you in a 15-foot Emanation for the duration. If you are good or neutral, their
    spectral form appears angelic or fey (your choice). If you are evil, they appear fiendish.

    When you cast this spell, you can designate creatures to be unaffected by it. Any other creature’s Speed is halved
    in the Emanation, and whenever the Emanation enters a creature’s space and whenever a creature enters the Emanation
    or ends its turn there, the creature must make a Wisdom saving throw. On a failed save, the creature takes 3d8
    Radiant damage (if you are good or neutral) or 3d8 Necrotic damage (if you are evil). On a successful save, the
    creature takes half as much damage. A creature makes this save only once per turn.

    Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 3.
*/
const version = "12.5.0";
const optionName = "Spirit Guardians";

try {
    let targetToken;
    let originActor;
    let sourceItem;
    let eventName = 'tokenEnter';

    if (args[0] === "on") {
        if ((typeof midiData !== 'undefined') && midiData.workflowOptions && midiData.workflowOptions.isOverTime) {
            targetToken = workflow.effectTargets.first().document;
            originActor = actor;
            sourceItem = originActor.items.find(i => i.name === optionName && i.type === 'spell');

        }
        else if (lastArgValue && lastArgValue.tokenUuid) {
            targetToken = await fromUuid(lastArgValue.tokenUuid);
            originActor = await fromUuid(lastArgValue.origin);
            const castData = lastArgValue.efData.flags['midi-qol'].castData;
            sourceItem = await fromUuid(castData.itemUuid);

        }

        await applySpellDamage(targetToken, originActor, sourceItem, eventName);
    }
    else if (args[0] === "each" && lastArgValue.turn === 'endTurn') {
        eventName = 'tokenTurnStart';
        if (lastArgValue.turn === 'endTurn') {
            eventName = 'tokenTurnEnd';
        }

        originActor = await fromUuid(lastArgValue.origin);
        const castData = lastArgValue.efData.flags['midi-qol'].castData;
        sourceItem = await fromUuid(castData.itemUuid);

        // ignore friendlies
        let sourceDisposition = CONST.TOKEN_DISPOSITIONS.FRIENDLY;
        const sourceToken = canvas.scene.tokens.find(t => t.actor.id === sourceItem.parent.id);
        if (sourceToken) {
            sourceDisposition = sourceToken.disposition;
        }
        if (token.document.disposition === sourceDisposition) return;

        // apply damage
        await applySpellDamage(token.document, originActor, sourceItem, eventName);
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

// target token must be a document
async function applySpellDamage(targetToken, originActor, sourceItem, eventName) {
    if (targetToken) {
        // make sure the target is not flagged as never target
        const neverTargetFlag = targetToken.actor.getFlag("midi-qol", "neverTarget");
        if (neverTargetFlag) {
            console.log(`${optionName} - skipping target ${targetToken.name} - flagged as neverTarget`);
            return;
        }

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

                    await MidiQOL.completeActivityUse(activity.uuid, options, {}, {});
                }
            }
        }
    }
}
