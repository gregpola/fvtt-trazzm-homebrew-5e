const optionName = "Call Lightning";
const version = "12.4.2";

try {
    if (rolledActivity?.name === "Summon Storm") {
        if (args[0].macroPass === "preItemRoll") {
            Hooks.once("createMeasuredTemplate", async (template) => {
                await template.update({
                    fillColor: 0,
                    fillAlpha: 0,
                    alpha: 0,
                    opacity: 0.1
                });
            });
        }
    }

} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
