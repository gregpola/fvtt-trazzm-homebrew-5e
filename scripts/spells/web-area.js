/*
    You conjure a mass of sticky webbing at a point within range. The webs fill a 20-foot Cube there for the duration.
    The webs are Difficult Terrain, and the area within them is Lightly Obscured.

    If the webs aren’t anchored between two solid masses (such as walls or trees) or layered across a floor, wall, or
    ceiling, the web collapses on itself, and the spell ends at the start of your next turn. Webs layered over a flat
    surface have a depth of 5 feet.

    The first time a creature enters the webs on a turn or starts its turn there, it must succeed on a Dexterity saving
    throw or have the Restrained condition while in the webs or until it breaks free.

    A creature Restrained by the webs can take an action to make a Strength (Athletics) check against your spell save DC.
    If it succeeds, it is no longer Restrained.

    The webs are flammable. Any 5-foot Cube of webs exposed to fire burns away in 1 round, dealing 2d4 Fire damage to
    any creature that starts its turn in the fire.
 */
const optionName = "Web";
const version = "12.4.0";
const _flagGroup = "fvtt-trazzm-homebrew-5e";

// the enter or end turn macro
const combatTime = game.combat ? `${game.combat.id}-${game.combat.round + game.combat.turn / 100}` : 1;
let targetToken = event.data.token;
if (targetToken) {
    if (event.name === 'tokenExit') {
        await targetToken.actor.toggleStatusEffect('restrained', {active: false});
    }
    else {
        const originActor = await fromUuid(region.flags['region-attacher'].actorUuid);
        const sourceItem = await fromUuid(region.flags['region-attacher'].itemUuid);

        let targetCombatant = game.combat.getCombatantByToken(targetToken);
        if (targetCombatant) {
            const flagName = `web-${originActor.id}`;
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
                        await tt.actor.toggleStatusEffect('restrained', {active: true});
                    }
                }
            }
        }
    }
}

