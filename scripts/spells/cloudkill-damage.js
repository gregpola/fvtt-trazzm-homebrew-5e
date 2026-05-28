/*
    You create a 20-foot-radius Sphere of yellow-green fog centered on a point within range. The fog lasts for the
    duration or until strong wind (such as the one created by Gust of Wind) disperses it, ending the spell. Its area is
    Heavily Obscured.

    Each creature in the Sphere makes a Constitution saving throw, taking 5d8 Poison damage on a failed save or half as
    much damage on a successful one. A creature must also make this save when the Sphere moves into its space and when
    it enters the Sphere or ends its turn there. A creature makes this save only once per turn.

    The Sphere moves 10 feet away from you at the start of each of your turns.
 */
const optionName = "Cloudkill";
const version = "14.5.0";

try {
    let originActor = (await fromUuid(lastArgValue?.origin))?.actor;

    if (args[0] === "on") {
        await applySpellDamage(token, originActor, macroItem, 'tokenEnter');

    }
    else if (args[0] === "each" && lastArgValue.turn === 'endTurn') {
        await applySpellDamage(token, originActor, macroItem, 'tokenTurnEnd');

    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applySpellDamage(targetToken, originActor, sourceItem, eventName) {
    if (targetToken) {
        // make sure the target is not flagged as never target
        const neverTargetFlag = targetToken.actor.getFlag("midi-qol", "neverTarget");
        if (neverTargetFlag) {
            console.log(`${optionName} - skipping target ${targetToken.name} - flagged as neverTarget`);
            return;
        }

        let targetCombatant = game.combat.getCombatantByToken(targetToken.document);
        if (targetCombatant) {
            const flagName = `cloudkill-damage-${originActor.id}`;
            if (HomebrewHelpers.perTurnCheck(targetCombatant, flagName, eventName)) {
                // synthetic activity use
                const activity = sourceItem.system.activities.find(a => a.identifier === 'apply-damage');
                if (activity) {
                    await HomebrewHelpers.setTurnCheck(targetCombatant, flagName);
                    let targetUuids = [targetToken.document.uuid];

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
