/*
    Whenever you take the Bonus Action to create or move the illusion of your Invoke Duplicity, you can teleport, swapping places with the illusion.
*/
const optionName = "Trickster's Transposition";
const version = "12.4.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const targetToken = workflow.targets.first();
        await HomebrewMacros.swapTokenPositions(token, targetToken);
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

