/*
    Nonflammable grease covers the ground in a 10-foot square centered on a point within range and turns it into
    Difficult Terrain for the duration.

    When the grease appears, each creature standing in its area must succeed on a Dexterity saving throw or have the
    Prone condition. A creature that enters the area or ends its turn there must also succeed on that save or fall Prone.
*/
const optionName = "Grease";
const version = "12.4.0";

// the enter or end turn macro
const combatTime = game.combat ? `${game.combat.id}-${game.combat.round + game.combat.turn / 100}` : 1;
let targetToken = event.data.token;
if (targetToken) {
    const originActor = await fromUuid(region.flags['region-attacher'].actorUuid);
    const sourceItem = await fromUuid(region.flags['region-attacher'].itemUuid);

    let targetCombatant = game.combat.getCombatantByToken(targetToken);
    if (targetCombatant) {
        const flagName = `grease-${originActor.id}`;
        if (HomebrewHelpers.perTurnCheck(targetCombatant, flagName, event.name)) {
            // synthetic activity use
            const activity = sourceItem.system.activities.find(a => a.identifier === 'token-enters');
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
                let activityWorkflow = await MidiQOL.completeActivityUse(activity.uuid, options, {}, {});
                for (let tt of activityWorkflow.failedSaves) {
                    await tt.actor.toggleStatusEffect('prone', {active: true});
                }
            }
        }
    }
}

