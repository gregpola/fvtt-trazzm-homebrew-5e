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
const version = "10.0";
const optionName = "Feat - Chef";

const specialFoodName = "Chef's Special Food";
const specialFoodId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-items.BlLKDX7ZtXAaEwaV";

const specialTreatName = "Chef's Special Treat";
const specialTreatId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-items.Gr0kQ0RbfcA41xH8";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const wf = scope.workflow;
        const profBonus = actor.system.attributes.prof;

        // Ask which food option to prepare
        new Dialog({
            title: "Which dish would you like to prepare?",
            buttons: {
                one: {
                    icon: '<p> </p><img src = "icons/consumables/food/plate-fish-grilled-brown.webp" width="50" height="50"></>',
                    label: "<p>Short Rest - Special Food</p>",
                    callback: async () => {
                        // import the food item if needed
                        let specialFoodItem = game.items.getName(specialFoodName);
                        if (!specialFoodItem) {
                            specialFoodItem = await fromUuid(specialFoodId);
                            if (!specialFoodItem) {
                                ui.notifications.error(`${optionName} - unable to find the ${specialFoodName}`);
                                return;
                            }
                        }

                        // add the food to the actors inventory, they can dispense it
                        let tempItem = specialFoodItem.toObject();
                        tempItem.system.quantity = 4 + profBonus;
                        await actor.createEmbeddedDocuments('Item',[tempItem]);

                        ChatMessage.create({
                            content: `${actor.name} has prepared a revitalizing meal`,
                            speaker: ChatMessage.getSpeaker({ actor: actor })});

                    }
                },
                two: {
                    icon: '<p> </p><img src = "icons/consumables/food/cooked-kebab-meat-skewer-red.webp" width="50" height="50"></>',
                    label: "<p>Special Treats (temp HP)</p>",
                    callback: async () => {
                        // import the food item if needed
                        let specialTreatItem = game.items.getName(specialTreatName);
                        if (!specialTreatItem) {
                            specialTreatItem = await fromUuid(specialTreatId);
                            if (!specialTreatItem) {
                                ui.notifications.error(`${optionName} - unable to find the ${specialTreatName}`);
                                return;
                            }
                        }

                        // add the food to the actors inventory, they can dispense it
                        let tempItem = specialTreatItem.toObject();
                        tempItem.system.quantity = profBonus;
                        tempItem.system.damage.parts[0][0] = profBonus.toString();
                        await actor.createEmbeddedDocuments('Item',[tempItem]);

                        ChatMessage.create({
                            content: `${actor.name} has prepared an invigorating snack`,
                            speaker: ChatMessage.getSpeaker({ actor: actor })});
                    }
                },
                cancel: {
                    icon: '<p> </p><img src = "icons/skills/melee/weapons-crossed-swords-yellow.webp" width="50" height="50"></>',
                    label: "<p>Cancel</p>",
                    callback: () => { return; }
                }
            },
        }).render(true);
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
