try {
    if (args[0].macroPass === "preItemRoll") {
        Hooks.once("createMeasuredTemplate", async (template) => {
            await template.update({
                fillAlpha: 0,
                alpha: 0,
                opacity: 0.1
            });
        });

        Hooks.once("createRegion", async (region) => {
            await region.update({'visibility': 0});
        });
    }

} catch (err) {
    console.error('Generic Template', err);
}
