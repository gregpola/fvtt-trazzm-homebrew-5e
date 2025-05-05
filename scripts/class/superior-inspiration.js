/*
    When you roll Initiative, you regain expended uses of Bardic Inspiration until you have two if you have fewer than that.
*/
const optionName = "Superior Inspiration";
const version = "12.4.0";

try {
    const feature = actor.items.getName("Bardic Inspiration");
    if (feature) {
        const maxValue = feature.system.uses.max;
        const spentValue = feature.system.uses.spent;
        const currentValue = maxValue - spentValue;

        if (currentValue < 2 && maxValue > 1) {
            const newValue = maxValue - 2;
            await feature.update({"system.uses.spent": newValue});
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}


