/*
    The troll regains 10 Hit Points at the start of each of its turns. If the troll takes Acid or Fire damage, this
    trait doesn’t function on the troll’s next turn. The troll dies only if it starts its turn with 0 Hit Points and
    doesn’t regenerate.
*/
const optionName = "Regeneration";
const version = "14.5.1";

const _suppressionTypes = ['acid', 'fire'];
const _healingFormula = "10";

const _regenSuppressedId = "suppress-regeneration";
const _regenOffId = "regeneration-off";
const _regenerationTimeFlag = "regeneration-time-flag";

try {
    if (args[0].tag === "TargetOnUse" && args[0].macroPass === "preTargetDamageApplication") {
        // Check for damage type suppressions
        const applicableRolls = workflow.damageDetail.filter(i => _suppressionTypes.includes(i.type));
        if (applicableRolls && applicableRolls.length > 0) {
            // Suppress Regeneration
            const activity = macroItem.system.activities.find(a => a.identifier === _regenSuppressedId);
            if (activity) {
                // get the actor owner
                let actorUser = MidiQOL.playerForActor(actor);
                if (!actorUser?.active) {
                    console.info(`${optionName} - unable to locate the actor player, sending to GM`);
                    actorUser = game.users?.activeGM;
                }

                const options = {
                    midiOptions: {
                        noOnUseMacro: true,
                        configureDialog: false,
                        showFullCard: false,
                        ignoreUserTargets: true,
                        checkGMStatus: true,
                        autoRollAttack: true,
                        autoRollDamage: "always",
                        fastForwardAttack: true,
                        fastForwardDamage: true,
                        asUser: actorUser.id,
                        workflowData: true
                    }
                };

                await MidiQOL.completeActivityUse(activity.uuid, options, {}, {});
            }
        }

        // check for death ???
        if ((workflow.damageItem.newHP === 0) && !shouldRegenerateThisTurn(actor)) {
            const stopActivity = macroItem.system.activities.find(a => a.identifier === _regenOffId);
            if (stopActivity) {
                // get the actor owner
                let actorUser = MidiQOL.playerForActor(actor);
                if (!actorUser?.active) {
                    console.info(`${optionName} - unable to locate the actor player, sending to GM`);
                    actorUser = game.users?.activeGM;
                }

                const options = {
                    midiOptions: {
                        noOnUseMacro: true,
                        configureDialog: false,
                        showFullCard: false,
                        ignoreUserTargets: true,
                        checkGMStatus: true,
                        autoRollAttack: true,
                        autoRollDamage: "always",
                        fastForwardAttack: true,
                        fastForwardDamage: true,
                        asUser: actorUser.id,
                        workflowData: true
                    }
                };

                await MidiQOL.completeActivityUse(stopActivity.uuid, options, {}, {});
            }
        }

    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

function shouldRegenerateThisTurn(actor) {
    if (!HomebrewHelpers.isAvailableThisTurn(actor, _regenerationTimeFlag)) {
        return false;
    }

    // check for dead
    const noRegenEffect = actor.effects.getName("Regeneration Off");
    if (noRegenEffect) {
        return false;
    }

    // check for suppressed
    const suppressedEffect = actor.effects.getName("Regeneration Suppressed");
    if (suppressedEffect) {
        return false;
    }

    // check for full health
    var currentHP = actor.system.attributes.hp.value;
    var maxHP = actor.system.attributes.hp.max;
    if (currentHP === maxHP) {
        return false;
    }

    return true;
}
