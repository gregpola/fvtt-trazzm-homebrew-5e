/*
    A flickering flame appears in your hand and remains there for the duration. While there, the flame emits no heat and
    ignites nothing, and it sheds Bright Light in a 20-foot radius and Dim Light for an additional 20 feet. The spell
    ends if you cast it again.

    Until the spell ends, you can take a Magic action to hurl fire at a creature or an object within 60 feet of you.
    Make a ranged spell attack. On a hit, the target takes 1d8 Fire damage.
*/
const version = "14.5.0";
const optionName = "Produce Flame";
const effectName = "Produce Flame Light";

try {
    if (args[0].macroPass === "postActiveEffects") {
        await HomebrewEffects.removeEffectByName(actor, effectName);
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
