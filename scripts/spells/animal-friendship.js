/*
    This spell lets you convince a beast that you mean it no harm. Choose a beast that you can see within range. It must
    see and hear you. If the beast's Intelligence is 4 or higher, the spell fails. Otherwise, the beast must succeed on
    a Wisdom saving throw or be charmed by you for the spell's duration. If you or one of your companions harms the
    target, the spell ends.
*/
const version = "12.3.0";
const optionName = "Animal Friendship";

try {
    if (args[0].macroPass === "postActiveEffects") {
        for (let targetToken of workflow.failedSaves) {
            // check int
            if (targetToken.actor.system.abilities.int.value < 4) {
                await HomebrewEffects.applyCharmedEffect(targetToken.actor, item.uuid, undefined, HomebrewHelpers.itemDurationSeconds(item));
            }
            else {
                console.log(`${optionName}: ${version} - failed, ${targetToken.name} has too high of intelligence`);
            }
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
