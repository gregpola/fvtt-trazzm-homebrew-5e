/*
    You must be proficient with wind instruments to use these pipes. They have 3 charges. You can use an action to play
    them and expend 1 charge to create an eerie, spellbinding tune. Each creature within 30 feet of you that hears you
    play must succeed on a DC 15 Wisdom saving throw or become Frightened of you for 1 minute. If you wish, all creatures
    in the area that aren't hostile toward you automatically succeed on the saving throw. A creature that fails the
    saving throw can repeat it at the end of each of its turns, ending the effect on itself on a success. A creature that
    succeeds on its saving throw is immune to the effect of these pipes for 24 hours. The pipes regain 1d3 expended
    charges daily at dawn.
*/
const version = "11.0";
const optionName = "Pipes of Haunting";

try {
    if (args[0].macroPass === "postActiveEffects") {
        // check for proficiency
        if (!workflow.item.system.prof.hasProficiency) {
            return 	ui.notifications.error(`${optionName}: player is not proficient`);
        }

        const targetTokens = MidiQOL.findNearby(CONST.TOKEN_DISPOSITIONS.HOSTILE, token, 30, {canSee: true});
        for (let target of targetTokens) {
            let saveRoll = await target.actor.rollAbilitySave("wis", {flavor: "Pipes of Haunting - DC 15", damageType: "frightened"});

            if (saveRoll.total < 15) {
                if (!HomebrewHelpers.hasConditionImmunity(target.actor, "frightened")) {
                    await game.dfreds.effectInterface.addEffect({
                        'effectName': 'Frightened',
                        'uuid': target.actor.uuid,
                        'origin': actor.uuid,
                        'overlay': true
                    });
                }
            }
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
