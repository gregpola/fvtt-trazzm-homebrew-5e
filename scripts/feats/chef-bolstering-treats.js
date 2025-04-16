/*
    With 1 hour of work or when you finish a Long Rest, you can cook a number of treats equal to your Proficiency Bonus
    if you have ingredients and Cook’s Utensils on hand. These special treats last 8 hours after being made. A creature
    can use a Bonus Action to eat one of those treats to gain a number of Temporary Hit Points equal to your Proficiency Bonus.
*/
const version = "12.4.0";
const optionName = "Chef - Bolstering Treats";
const treatId = "Compendium.fvtt-trazzm-homebrew-5e.trazzm-automation-items-2024.Item.lFMAMzOZ9BCoj3Sm";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let specialTreatItem = await fromUuid(treatId);
        const profBonus = actor.system.attributes.prof;

        // add the food to the actors inventory, they can dispense it
        let tempItem = specialTreatItem.toObject();
        tempItem.system.quantity = profBonus;
        let results = await actor.createEmbeddedDocuments('Item',[tempItem]);
        let activity = results[0].system.activities.getName("Eat");
        await activity.update({"healing.custom.formula" : profBonus.toString()});

        ChatMessage.create({
            content: `${actor.name} has prepared an invigorating snack`,
            speaker: ChatMessage.getSpeaker({ actor: actor })});
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
