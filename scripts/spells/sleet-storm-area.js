/*
    Until the spell ends, sleet falls in a 40-foot-tall, 20-foot-radius Cylinder centered on a point you choose within
    range. The area is Heavily Obscured, and exposed flames in the area are doused.

    Ground in the Cylinder is Difficult Terrain. When a creature enters the Cylinder for the first time on a turn or
    starts its turn there, it must succeed on a Dexterity saving throw or have the Prone condition and lose Concentration.
*/
const optionName = "Sleet Storm";
const version = "12.4.0";
const _flagGroup = "fvtt-trazzm-homebrew-5e";

// the enter or turn start macro
const combatTime = game.combat ? `${game.combat.id}-${game.combat.round + game.combat.turn / 100}` : 1;
let targetToken = event.data.token;
if (targetToken) {
    const originActor = await fromUuid(region.flags['region-attacher'].actorUuid);
    const sourceItem = await fromUuid(region.flags['region-attacher'].itemUuid);

    if (originActor && sourceItem) {
        let targetCombatant = game.combat.getCombatantByToken(targetToken);
        if (targetCombatant) {
            const flagName = `sleet-storm-${originActor.id}`;
            if (HomebrewHelpers.perTurnCheck(targetCombatant, flagName, event.name)) {
                // synthetic activity use
                const activity = sourceItem.system.activities.find(a => a.identifier === 'sleet-storm-enter');
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

                    // handle prone and loss of concentration
                    for (let tt of activityWorkflow.failedSaves) {
                        await tt.actor.toggleStatusEffect('prone', {active: true});
                        let concentrationEffect = MidiQOL.getConcentrationEffect(tt.actor);
                        if (concentrationEffect) {
                            //await concentrationEffect.delete();
                            await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: tt.actor.uuid, effects: [concentrationEffect.id] });
                        }
                    }
                }
            }
        }
    }
}

