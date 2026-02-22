/*
    As long as it has at least one diamond, the helm emits a 30-foot Emanation. When at least one Undead is within that
    area, the Emanation is filled with Dim Light. Any Undead that starts its turn in that area takes 1d6 Radiant damage.
*/
const optionName = "Helm of Brilliance - Diamond Light";
const version = "13.5.0";
const damageType = "radiant";

try {
    if (args[0] === "each" && lastArgValue.turn === 'startTurn') {
        // make sure the target is not flagged as never target
        const neverTargetFlag = token.actor.getFlag("midi-qol", "neverTarget");
        if (!neverTargetFlag) {
            const originActor = await fromUuid(lastArgValue.origin);
            let targetCombatant = game.combat.getCombatantByToken(token.document);
            if (targetCombatant) {
                const flagName = `diamond-light-${originActor.id}`;
                if (HomebrewHelpers.perTurnCheck(targetCombatant, flagName, 'tokenTurnStart')) {
                    // synthetic activity use
                    const activity = macroItem.system.activities.find(a => a.identifier === 'diamond-light-damage');
                    if (activity) {
                        await HomebrewHelpers.setTurnCheck(targetCombatant, flagName);

                        const options = {
                            midiOptions: {
                                targetsToUse: new Set([token]),
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

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
