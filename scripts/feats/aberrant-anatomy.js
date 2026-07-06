/*
    Immediately after you make a D20 Test and roll a 1 on the d20, the aberrant influence infecting your form flares,
    wrenching control of your flesh. Make a Constitution saving throw (DC 13 plus your Proficiency Bonus). On a failed
    save, you have the Stunned condition until the end of your next turn.
*/
const optionName = "Aberrant Anatomy";
const version = "14.5.0";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postActiveEffects") {
        // check for ability check, saving throw, or attack roll
        if (rolledActivity.type === 'attack' || rolledActivity.type === 'attack' || rolledActivity.type === 'attack') {
            // check for a roll of 1

        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
