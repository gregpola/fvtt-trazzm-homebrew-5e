/*
    This copper coin is stamped with an image of lady luck playing a lyre. A bard carrying this coin can use bardic
    inspiration an extra time before needing to rest.
*/
const version = "11.0";
const optionName = "Coin of Singing";
const resourceName = "Bardic Inspiration";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let inspirationUses = actor.items.find(i => i.name === resourceName);
        if (inspirationUses) {
            const currentValue = inspirationUses.system.uses.value;
            if (currentValue < inspirationUses.system.uses.max) {
                const newValue = inspirationUses.system.uses.value + 1;
                await inspirationUses.update({"system.uses.value": newValue});
            }
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
