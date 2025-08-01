/*
    You brandish the weapon used in the spell’s casting and make a melee attack with it against one creature within
    5 feet of you. On a hit, the target suffers the weapon attack’s normal effects and then becomes sheathed in booming
    energy until the start of your next turn. If the target willingly moves 5 feet or more before then, the target takes
    1d8 thunder damage, and the spell ends.

    This spell’s damage increases when you reach certain levels. At 5th level, the melee attack deals an extra 1d8
    thunder damage to the target on a hit, and the damage the target takes for moving increases to 2d8. Both damage
    rolls increase by 1d8 at 11th level (2d8 and 3d8) and again at 17th level (3d8 and 4d8).
*/
const optionName = "Booming Blade";
const version = "12.4.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
