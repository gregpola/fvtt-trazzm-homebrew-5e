/*
    Any creature hostile to the droth that starts its turn within 20 feet of the droth must succeed on a DC 17 Wisdom
    saving throw or have disadvantage on all attack rolls until the end of its next turn. Creatures with Intelligence
    3 or lower automatically fail the saving throw.
*/
const optionName = "Soothing Aura";
const version = "13.5.0";

try {
    let targetToken = token;
    let originActor;
    let sourceItem = item;

    if (args[0] === "on") {
        if (lastArgValue && lastArgValue.tokenUuid) {
            originActor = item.actor;
        }

        await applySavingThrow(targetToken, originActor, sourceItem);
    }
    else if (args[0] === "each" && lastArgValue.turn === 'startTurn') {
        originActor = item.actor;

        // ignore friendlies
        let sourceDisposition = CONST.TOKEN_DISPOSITIONS.FRIENDLY;
        const sourceToken = canvas.scene.tokens.find(t => t.actor.id === sourceItem.parent.id);
        if (sourceToken) {
            sourceDisposition = sourceToken.disposition;
        }
        if (token.document.disposition === sourceDisposition) return;

        // apply damage
        await applySavingThrow(token.document, originActor, sourceItem);
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

// target token must be a document
async function applySavingThrow(targetToken, originActor, sourceItem) {
    if (targetToken) {
        let targetCombatant = game.combat.getCombatantByToken(targetToken);
        if (targetCombatant) {
            const flagName = `soothing-aura-${originActor.id}`;
            if (HomebrewHelpers.perTurnCheck(targetCombatant, flagName, 'tokenTurnStart', true, token.id)) {
                // synthetic activity use
                const activity = sourceItem.system.activities.find(a => a.identifier === 'soothing-aura-save');
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
