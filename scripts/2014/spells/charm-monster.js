/*
    You attempt to charm a creature you can see within range. It must make a Wisdom saving throw, and it does so with
    advantage if you or your companions are fighting it. If it fails the saving throw, it is charmed by you until the
    spell ends or until you or your companions do anything harmful to it. The charmed creature is friendly to you. When
    the spell ends, the creature knows it was charmed by you.
*/
const version = "12.3.0";
const optionName = "Charm Monster";

try {
    if (args[0].macroPass === "postActiveEffects") {
        for (let targetToken of workflow.failedSaves) {
            await HomebrewEffects.applyCharmedEffect(targetToken.actor, item.uuid, undefined, HomebrewHelpers.itemDurationSeconds(item));
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
