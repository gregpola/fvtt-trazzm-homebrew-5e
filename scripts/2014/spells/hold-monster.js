/*
    Choose a creature that you can see within range. The target must succeed on a Wisdom saving throw or be Paralyzed
    for the Duration. This spell has no effect on Undead. At the end of each of its turns, the target can make another
    Wisdom saving throw. On a success, the spell ends on the target.

    At Higher Levels. When you cast this spell using a spell slot of 6th level or higher, you can target one additional
    creature for each slot level above 5th. The creatures must be within 30 feet of each other when you target them.
*/
const version = "12.3.0";
const optionName = "Hold Monster";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const spellDC = actor.system.attributes.spelldc;
        for (let targetToken of workflow.failedSaves) {
            await HomebrewEffects.applyParalyzedEffect(targetToken.actor, item.uuid, undefined,
                HomebrewHelpers.itemDurationSeconds(item), `turn=end, saveAbility=wis, saveDC=${spellDC}, label=Hold Person`);
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
