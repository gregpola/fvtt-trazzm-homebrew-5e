/*
    Melee Weapon Attack: +14 to hit, reach 10 ft., one target. Hit: 22 (3d8 + 9) piercing damage. If the target is a
    Large or smaller creature, it must succeed on a DC 19 Dexterity saving throw or be swallowed by the worm. A swallowed
    creature is blinded and restrained, it has total cover against attacks and other effects outside the worm, and it
    takes 21 (6d6) acid damage at the start of each of the worm's turns.

    If the worm takes 30 damage or more on a single turn from a creature inside it, the worm must succeed on a DC 21
    Constitution saving throw at the end of that turn or regurgitate all swallowed creatures, which fall prone in a
    space within 10 feet of the worm. If the worm dies, a swallowed creature is no longer restrained by it and can
    escape from the corpse by using 20 feet of movement, exiting prone.
*/
const version = "12.3.0";
const optionName = "Purple Worm Bite";
const _flagGroup = "fvtt-trazzm-homebrew-5e";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let targetToken = workflow.failedSaves.first();
        if (targetToken) {
            await HomebrewMacros.pullTarget(token, targetToken, 2);
        }
    }
    else if (args[0] === "each") {
        // get all the tokens that are swallowed by this worm
        let swallowedTokens = canvas.tokens.placeables.filter(t => t.actor.getRollData().effects.find(e => e.name === 'Swallowed' && e.origin === item.uuid));
        if (swallowedTokens.length > 0) {
            const damageRoll = await new Roll("6d6").roll();
            await new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "acid", swallowedTokens, damageRoll, {itemCardId: "new", itemData: item});
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
