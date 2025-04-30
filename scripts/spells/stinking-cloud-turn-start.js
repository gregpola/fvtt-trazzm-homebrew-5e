/*
    You create a 20-foot-radius Sphere of yellow, nauseating gas centered on a point within range. The cloud is Heavily
    Obscured. The cloud lingers in the air for the duration or until a strong wind (such as the one created by Gust of
    Wind) disperses it.

    Each creature that starts its turn in the Sphere must succeed on a Constitution saving throw or have the Poisoned
    condition until the end of the current turn. While Poisoned in this way, the creature can’t take an action or a
    Bonus Action.
 */
const version = "12.4.0";
const optionName = "Cloudkill";
const _flagGroup = "fvtt-trazzm-homebrew-5e";

// the enter or end turn macro
const combatTime = game.combat ? `${game.combat.id}-${game.combat.round + game.combat.turn / 100}` : 1;
let targetToken = event.data.token;
if (targetToken) {
    const originActor = await fromUuid(region.flags['region-attacher'].actorUuid);
    const sourceItem = await fromUuid(region.flags['region-attacher'].itemUuid);

    let targetCombatant = game.combat.getCombatantByToken(targetToken);
    if (targetCombatant) {
        const flagName = `stinking-cloud-${originActor.id}`;
        if (HomebrewHelpers.perTurnCheck(targetCombatant, flagName, event.name)) {
            // synthetic activity use
            const activity = sourceItem.system.activities.find(a => a.identifier === 'start-of-turn-save');
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

