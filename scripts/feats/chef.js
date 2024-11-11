/*
    Time spent mastering the culinary arts has paid off , granting you the following benefits:

        Increase your Constitution or Wisdom score by 1, to a maximum of 20.

        You gain proficiency with cook’s utensils if you don’t already have it.

        As part of a short rest, you can cook special food, provided you have ingredients and cook’s utensils on hand.
        You can prepare enough of this food for a number of creatures equal to 4 + your proficiency bonus. At the end of
        the short rest, any creature who eats the food and spends one or more Hit Dice to regain hit points regains an
        extra 1d8 hit points.

        With one hour of work or when you finish a long rest, you can cook a number of treats equal to your proficiency
        bonus. These special treats last 8 hours after being made. A creature can use a bonus action to eat one of those
        treats to gain temporary hit points equal to your proficiency bonus.
 */
const version = "12.3.0";
const optionName = "Feat - Chef";

const specialFoodName = "Chef's Special Food";
const specialFoodId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-items.Item.BlLKDX7ZtXAaEwaV";

const specialTreatName = "Chef's Special Treat";
const specialTreatId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-items.Item.Gr0kQ0RbfcA41xH8";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const profBonus = actor.system.attributes.prof;

        // Ask which food option to prepare
        const content = `
			<p>Which dish would you like to prepare?</p>
			<label style="margin-right: 10px; margin-bottom: 10px;"><input type="radio" name="choice" value="food" checked>   ${specialFoodName}  <img src='icons/consumables/food/plate-fish-grilled-brown.webp' width='30' height='30' style='border: 5px; vertical-align: middle;'/></label>
			<label style="margin-right: 10px; margin-bottom: 10px;"><input type="radio" name="choice" value="treat">   ${specialTreatName}  <img src='icons/consumables/food/cooked-kebab-meat-skewer-red.webp' width='30' height='30' style='border: 5px; vertical-align: middle;'/></label>`;

        let flavor = await foundry.applications.api.DialogV2.prompt({
            content: content,
            rejectClose: false,
            ok: {
                callback: (event, button, dialog) => {
                    return button.form.elements.choice.value;
                }
            },
            window: {
                title: `${optionName}`,
            },
            position: {
                width: 400
            }
        });

        if (flavor === 'food') {
            let specialFoodItem = await fromUuid(specialFoodId);

            // add the food to the actors inventory, they can dispense it
            let tempItem = specialFoodItem.toObject();
            tempItem.system.quantity = 4 + profBonus;
            await actor.createEmbeddedDocuments('Item',[tempItem]);

            ChatMessage.create({
                content: `${actor.name} has prepared a revitalizing meal`,
                speaker: ChatMessage.getSpeaker({ actor: actor })});
        }
        else if (flavor === 'treat') {
            let specialTreatItem = await fromUuid(specialTreatId);

            // add the food to the actors inventory, they can dispense it
            let tempItem = specialTreatItem.toObject();
            tempItem.system.quantity = profBonus;
            tempItem.system.damage.parts[0][0] = profBonus.toString();
            await actor.createEmbeddedDocuments('Item',[tempItem]);

            ChatMessage.create({
                content: `${actor.name} has prepared an invigorating snack`,
                speaker: ChatMessage.getSpeaker({ actor: actor })});
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
