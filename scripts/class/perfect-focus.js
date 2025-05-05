/*
    When you roll Initiative and don't use Uncanny Metabolism, you regain expended Focus Points until you have 4 if you have 3 or fewer.
*/
const optionName = "Perfect Focus";
const version = "12.4.0";

try {
    const monksFocus = actor.items.getName("Monk's Focus");
    if (monksFocus) {
        const maxValue = monksFocus.system.uses.max; //4
        const spentValue = monksFocus.system.uses.spent;//1
        const currentValue = maxValue - spentValue;//3

        if (currentValue < 4 && maxValue > 3) {
            const newValue = maxValue - 4;
            await monksFocus.update({"system.uses.spent": newValue});
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}


