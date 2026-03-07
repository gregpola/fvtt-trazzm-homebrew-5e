/*
    In addition, when you hit a creature with an attack using a weapon, you can invoke the rune to summon fiery shackles:
    the target takes an extra 2d6 fire damage, and it must succeed on a Strength saving throw or be restrained for 1 minute.
    While restrained by the shackles, the target takes 2d6 fire damage at the start of each of its turns. The target can
    repeat the saving throw at the end of each of its turns, banishing the shackles on a success. Once you invoke this
    rune, you can’t do so again until you finish a short or long rest.
*/
const optionName = "Fire Rune";
const version = "13.5.0";

try {
    if (args[0].macroPass === "DamageBonus") {
        // make sure there are uses left
        const maxValue = macroItem.system.uses.max;
        const spentValue = macroItem.system.uses.spent;
        const currentValue = maxValue - spentValue;

        if (currentValue > 0) {
            // check action type
            if (["mwak", "rwak"].includes(rolledActivity.actionType)) {
                const description = `<p>Invoke your ${optionName}?</p>`
                    + '<p>Target takes an extra 2d6 fire damage, and it must succeed on a Strength saving throw or be restrained for 1 minute.'
                    + ' While restrained by the shackles, the target takes 2d6 fire damage at the start of each of its turns.'
                    + ' The target can repeat the saving throw at the end of each of its turns, banishing the shackles on a success.'
                    + '</p>';
                // ask if the player wants to use their rune
                const useRune = await foundry.applications.api.DialogV2.confirm({
                    window: {
                        title: `${optionName}`,
                    },
                    content: description,
                    rejectClose: false,
                    modal: true
                });

                if (useRune) {
                    let activity = await macroItem.system.activities.find(a => a.identifier === 'invoke-rune');
                    if (activity) {
                        activity.use();
                    }
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
