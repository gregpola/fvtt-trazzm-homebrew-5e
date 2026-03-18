/*
    You cause a cloud of mites, fleas, and other parasites to appear momentarily on one creature you can see within
    range. The target must succeed on a Constitution saving throw, or it takes 1d6 poison damage and moves 5 feet in a
    random direction if it can move and its speed is at least 5 feet. Roll a d4 for the direction:
        1, north; 2, south; 3, east; or 4, west.

    This movement doesn’t provoke opportunity attacks, and if the direction rolled is blocked, the target doesn’t move.
*/
const optionName = "Infestation";
const version = "13.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        for (let targetToken of workflow.failedSaves) {
            if (HomebrewHelpers.maxMovementRate(targetToken.actor) >= 5) {
                await HomebrewMacros.flingTarget(targetToken, 1);
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
