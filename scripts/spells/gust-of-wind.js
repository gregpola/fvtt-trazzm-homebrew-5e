/*
    A Line of strong wind 60 feet long and 10 feet wide blasts from you in a direction you choose for the duration. Each
    creature in the Line must succeed on a Strength saving throw or be pushed 15 feet away from you in a direction
    following the Line. A creature that ends its turn in the Line must make the same save.

    Any creature in the Line must spend 2 feet of movement for every 1 foot it moves when moving closer to you.

    The gust disperses gas or vapor, and it extinguishes candles and similar unprotected flames in the area. It causes
    protected flames, such as those of lanterns, to dance wildly and has a 50 percent chance to extinguish them.

    As a Bonus Action on your later turns, you can change the direction in which the Line blasts from you.
*/
const optionName = "Gust of Wind";
const version = "12.4.0";

try {
    if (rolledActivity?.name === "Cast" || rolledActivity?.name === "Change Direction") {
        if (args[0].macroPass === "preItemRoll") {
            Hooks.once("createMeasuredTemplate", async (template) => {
                await template.update({
                    fillColor: 0,
                    fillAlpha: 0,
                    alpha: 0,
                    opacity: 0.1
                });
            });

            Hooks.once("createRegion", async (region) => {
                await region.update({'visibility': 0});
            });
        }
        else if (args[0].macroPass === "postActiveEffects") {
            for (let targetToken of workflow.failedSaves) {
                await HomebrewMacros.pushTarget(token, targetToken, 3);
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
