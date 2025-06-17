/*
    You create a bonfire on ground that you can see within range. Until the spell ends, the magic bonfire fills a 5-foot
    cube. Any creature in the bonfire’s space when you cast the spell must succeed on a Dexterity saving throw or take
    1d8 fire damage. A creature must also make the saving throw when it moves into the bonfire’s space for the first
    time on a turn or ends its turn there.
 */
const optionName = "Create Bonfire";
const version = "12.4.0";

// the enter or end turn macro
const combatTime = game.combat ? `${game.combat.id}-${game.combat.round + game.combat.turn / 100}` : 1;
let targetToken = event.data.token;
if (targetToken) {
    const originActor = await fromUuid(region.flags['region-attacher'].actorUuid);
    const sourceItem = await fromUuid(region.flags['region-attacher'].itemUuid);

    let targetCombatant = game.combat.getCombatantByToken(targetToken);
    if (targetCombatant) {
        // synthetic activity use
        const activity = sourceItem.system.activities.find(a => a.identifier === 'create-bonfire-damage');
        if (activity) {
            let targets = new Set();
            targets.add(targetToken);

            const options = {
                midiOptions: {
                    targetsToUse: targets,
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
