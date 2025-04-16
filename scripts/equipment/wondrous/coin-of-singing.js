const version = "12.4.0";
const optionName = "Coin of Singing";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let bardicInspiration = actor.items.find(i => i.name === 'Bardic Inspiration');
        if (bardicInspiration) {
            const currentValue = bardicInspiration.system.uses.spent;
            if (currentValue > 0) {
                const newValue = bardicInspiration.system.uses.spent - 1;
                await bardicInspiration.update({"system.uses.spent": newValue});
            }
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
