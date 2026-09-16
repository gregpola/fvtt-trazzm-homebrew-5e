/**
 * When you cast an Evocation spell and deal damage with it, you can add your Proficiency Bonus to one damage roll of
 * that spell. Once you use this benefit, you can’t do so again until you finish a Long Rest.
 */
const optionName = "Arcane Overload";
const version = "14.5.0";
const timeFlag = "last-arcane-overload";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "preDamageRoll" && rolledItem.type === "spell" && rolledItem.system.school === "evo") {
        // check uses available
        const maxValue = macroItem.system.uses.max;
        const spentValue = macroItem.system.uses.spent;

        if (spentValue < maxValue) {
            const description = `<div style="margin-bottom: 5px;"><label>Apply Arcane Overload to your damage with '${rolledItem.name}'?</label></div>` +
                `<div style="white-space: pre-wrap;">
                    You can add your Proficiency Bonus to one damage roll of an Evocation spell once per day
                </div>`;

            const choice = await HomebrewHelpers.showUseAbilityDialog(actor, optionName, description, '');
            if (choice && choice !== 'No') {
                let activity = await macroItem.system.activities.getName("Power Surge");
                if (activity) {
                    await activity.use();
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
