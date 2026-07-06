/*
    Whenever you finish a Short or Long Rest, you can choose one skill or tool proficiency that you lack and gain it, as
    a ghostly presence shares its knowledge with you. You lose this proficiency when you use this benefit again to choose
    a different proficiency.
*/
const optionName = "Whispers of the Dead";
const version = "14.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        // Remove prior effects
        await HomebrewEffects.removePriorEffectsByOriginItem(actor, macroItem);
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
