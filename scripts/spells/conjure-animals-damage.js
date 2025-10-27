const optionName = "Conjure Animals";
const version = "13.5.0";
const _flagGroup = "fvtt-trazzm-homebrew-5e";

// the enter or end turn macro
const combatTime = game.combat ? `${game.combat.id}-${game.combat.round + game.combat.turn / 100}` : 1;
let targetToken = event.data.token;
if (targetToken) {
    const originActor = await fromUuid(region.flags['region-attacher'].actorUuid);
    if (!originActor) return;

    const sourceItem = await fromUuid(region.flags['region-attacher'].itemUuid);
    const sourceToken = canvas.scene.tokens.find(t => t.actor.id === originActor.id);

    // Have to be able to see the target
    const sightOk = MidiQOL.canSee(sourceToken, targetToken);
    if (!sightOk) return;

    let targetCombatant = game.combat.getCombatantByToken(targetToken);
    if (targetCombatant) {
        const flagName = `conjure-animals-${originActor.id}`;
        if (HomebrewHelpers.perTurnCheck(targetCombatant, flagName, event.name)) {
            // ignore friendlies
            let sourceDisposition = CONST.TOKEN_DISPOSITIONS.FRIENDLY;
            if (sourceToken) {
                sourceDisposition = sourceToken.disposition;
            }

            let targetDisposition = targetToken.disposition;
            if (!targetDisposition) {
                targetDisposition = targetToken.document.disposition;
            }

            if (targetDisposition === sourceDisposition) return;

            // synthetic activity use
            const activity = sourceItem.system.activities.find(a => a.identifier === 'conjure-animals-damage');
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
