/*
	This is used to trigger subclass features
*/
const optionName = "Innate Sorcery";
const version = "14.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        // Umbral Form - Shadow
        const umbralForm = actor.items.getName("Umbral Form");
        if (umbralForm) {
            const maxValue = umbralForm.system.uses.max;
            const spentValue = umbralForm.system.uses.spent;

            if (spentValue < maxValue) {
                let activity = await umbralForm.system.activities[0];
                if (activity) {
                    await activity.use();
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

