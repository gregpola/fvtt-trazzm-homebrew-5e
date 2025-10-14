/*
    You coat a 15-foot-wide cube with toxic sludge for the spell’s duration. The area is difficult terrain and filled
    with dangerous fumes. A creature that enters the area or starts its turn there must make a Constitution saving throw.
    On a failed saving throw, the creature takes 1d8 poison damage and is poisoned until the start of its next turn.
    Creatures are affected even if they hold their breath or don’t need to breathe.
*/
const optionName = "Biohazard";
const version = "13.5.0";

// the enter or end turn macro
let targetToken = event.data.token;
if (targetToken) {
    const sourceItem = await fromUuid(region.flags['region-attacher'].itemUuid);

    let targetCombatant = game.combat.getCombatantByToken(targetToken);
    if (targetCombatant) {
        // synthetic activity use
        const activity = sourceItem.system.activities.find(a => a.identifier === 'token-enters');
        if (activity) {
            const options = {
                midiOptions: {
                    targetsToUse: new Set([targetToken]),
                    noOnUseMacro: false,
                    configureDialog: false,
                    showFullCard: false,
                    ignoreUserTargets: true,
                    checkGMStatus: false,
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

