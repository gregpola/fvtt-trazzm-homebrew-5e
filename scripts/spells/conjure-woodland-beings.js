/*
    You conjure nature spirits that flit around you in a 10-foot Emanation for the duration. Whenever the Emanation
    enters the space of a creature you can see and whenever a creature you can see enters the Emanation or ends its turn
    there, you can force that creature to make a Wisdom saving throw. The creature takes 5d8 Force damage on a failed
    save or half as much damage on a successful one. A creature makes this save only once per turn.

    In addition, you can take the Disengage action as a Bonus Action for the spell’s duration.

    Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 4.
*/
const optionName = "Conjure Woodland Beings";
const version = "12.4.0";

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
        let targetCombatant = game.combat.getCombatantByToken(targetToken);
        if (targetCombatant) {
            const flagName = `woodland-beings-${originActor.id}`;
            if (HomebrewHelpers.perTurnCheck(targetCombatant, flagName, eventName)) {
                // synthetic activity use
                const activity = sourceItem.system.activities.find(a => a.identifier === 'woodland-beings-damage');
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
