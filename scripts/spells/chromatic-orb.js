/*
    You hurl an orb of energy at a target within range. Choose Acid, Cold, Fire, Lightning, Poison, or Thunder for the
    type of orb you create, and then make a ranged spell attack against the target. On a hit, the target takes
    3d8 damage of the chosen type.

    If you roll the same number on two or more of the d8s, the orb leaps to a different target of your choice within
    30 feet of the target. Make an attack roll against the new target, and make a new damage roll. The orb can’t leap
    again unless you cast the spell with a level 2+ spell slot.

    Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 1. The orb can leap a
    maximum number of times equal to the level of the slot expended, and a creature can be targeted only once by each
    casting of this spell.
*/
const optionName = "Chromatic Orb";
const version = "14.5.0";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _flagName = "chromatic-orb-leaps";
let combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn / 100}`;

try {
    if (args[0].macroPass === "postDamageRoll") {
        const targetToken = workflow.hitTargets.first();

        // check for duplicate damage rolls
        if (targetToken) {
            const matchingDice = workflow.damageRoll?.dice.filter(d => d.faces === 8)
                .flatMap(d => d.results.map(r => r.result))
                .filter((v, i, a) => a.indexOf(v) !== i);

            // Let the caster pick the next target
            if (matchingDice.length > 0) {
                let leapAllowed = true;
                const castLevel = workflow.castData.castLevel;
                let leaps = 0;

                let flag = actor.getFlag(_flagGroup, _flagName);
                if (flag) {
                    leaps = flag.leapCount;

                    // check turn cast
                    if (flag.lastUsed && flag.lastUsed === combatTime && leaps >= castLevel) {
                        leapAllowed = false;
                    }
                }

                if (leapAllowed) {
                    await leapAttack(token, macroItem, targetToken, castLevel, leaps);
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
async function leapAttack(casterToken, spellItem, primaryTargetToken, castLevel, leaps) {
    const potentialTargets = await MidiQOL.findNearby([0, 1], primaryTargetToken, 30, {canSee: true});
    if (potentialTargets.length === 0) {
        console.warn(`${optionName}: No potential leap target.`);
        return;
    }

    const secondaryTarget = await HomebrewHelpers.pickTarget(potentialTargets, `${optionName} - select leap target:`)
    if (secondaryTarget) {
        const newLeaps = leaps + 1;
        await casterToken.actor.setFlag(_flagGroup, _flagName, {
            leapCount : newLeaps,
            lastUsed : combatTime
        });

        let activity = spellItem.system.activities.getName("Orb Leap");
        if (activity) {
            const targetUuids = [secondaryTarget.document.uuid];
            await MidiQOL.completeActivityUse(activity, { midiOptions: { targetUuids } });
        }
    }
}
