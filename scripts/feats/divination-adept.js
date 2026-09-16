/**
 * Prescient Intervention. When a creature you can see within 60 feet of yourself makes a D20 Test, you can take a
 * Reaction to give that creature Advantage or Disadvantage (your choice) on that roll.
 *
 * Once you use this benefit, you can’t do so again until you finish a Long Rest. You can also regain use of this
 * feature when you cast a spell from the Divination school using a spell slot.
 */
const optionName = "Divination Adept";
const version = "14.5.0";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postActiveEffects" && rolledItem.type === "spell" && rolledItem.system.school === "div") {
        const spellLevel = workflow.castData.castLevel;

        // make sure it was cast using a spell slot???
        if (spellLevel > 0 && rolledActivity.consumption?.spellSlot) {
            const feature = actor.items.getName(optionName);
            if (feature) {
                const spentValue = feature.system.uses.spent;
                if (spentValue > 0) {
                    const newValue = spentValue - 1;
                    await feature.update({"system.uses.spent": newValue});
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
