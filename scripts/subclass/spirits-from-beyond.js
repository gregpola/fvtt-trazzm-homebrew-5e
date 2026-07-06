/*
    You can call forth spirits of the dead to empower you and your allies. When you take a Bonus Action to give a
    creature a Bardic Inspiration die, you can call forth the powers of a random spirit. To determine the spirit you
    channel, roll the Bardic Inspiration die and refer to the Spirits from Beyond table. The spirit remains channeled
    until you unleash it or until you finish a Short or Long Rest.

    Mystical Connection. You gain mastery over the spirits you call forth. Whenever you roll on the Spirits from Beyond
    table, you can roll the die twice and choose which of the two effects to bestow. If you roll the same number on both
    dice, you can instead choose any effect on the table.
*/
const version = "14.5.0";
const optionName = "Spirits from Beyond";

const spiritData = [
    {
        name: "Beloved",
        uuid: "Compendium.fvtt-trazzm-homebrew-5e.trazzm-subclasses-2024.Item.vkK5TcNeCsopyyvG"
    },
    {
        name: "Sharpshooter",
        uuid: "Compendium.fvtt-trazzm-homebrew-5e.trazzm-subclasses-2024.Item.WJFm3C0nPu3tN18x"
    },
    {
        name: "Avenger",
        uuid: "Compendium.fvtt-trazzm-homebrew-5e.trazzm-subclasses-2024.Item.2VwW2FJkIry1BCs2"
    },
    {
        name: "Renegade",
        uuid: "Compendium.fvtt-trazzm-homebrew-5e.trazzm-subclasses-2024.Item.fOBTyUeJkaS6HmKx"
    },
    {
        name: "Fortune Teller",
        uuid: "Compendium.fvtt-trazzm-homebrew-5e.trazzm-subclasses-2024.Item.ItUf1LdMudwcgR4n"
    },
    {
        name: "Wayfarer",
        uuid: "Compendium.fvtt-trazzm-homebrew-5e.trazzm-subclasses-2024.Item.2kClI6wSpiZlpdy3"
    },
    {
        name: "Trickster",
        uuid: "Compendium.fvtt-trazzm-homebrew-5e.trazzm-subclasses-2024.Item.jcJAFDEqJikVR8Hr"
    },
    {
        name: "Shade",
        uuid: "Compendium.fvtt-trazzm-homebrew-5e.trazzm-subclasses-2024.Item.C1DK5GcdJpZTI3xk"
    },
    {
        name: "Arsonist",
        uuid: "Compendium.fvtt-trazzm-homebrew-5e.trazzm-subclasses-2024.Item.gzlkFMVM6qrnedAq"
    },
    {
        name: "Coward",
        uuid: "Compendium.fvtt-trazzm-homebrew-5e.trazzm-subclasses-2024.Item.O8rbRzOgK60avXz5"
    },
    {
        name: "Brute",
        uuid: "Compendium.fvtt-trazzm-homebrew-5e.trazzm-subclasses-2024.Item.l4adgfl9ezUbOAsD"
    },
    {
        name: "Priest",
        uuid: "Compendium.fvtt-trazzm-homebrew-5e.trazzm-subclasses-2024.Item.OOG1sF7rLlvVgQKg"
    }
];

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postActiveEffects") {
        // look for Bardic Inspiration
        if (rolledItem.type === "feat" && rolledItem.name === "Bardic Inspiration" ) {
            let spiritItem = undefined;

            // get bardic inspiration die roll
            const rollResult = workflow.rolls[0].total;
            const maxValue = actor.system.scale.bard.inspiration.faces;

            // check for Mystical Connection
            const mysticalConnection = actor.items.getName("Mystical Connection");
            if (mysticalConnection) {
                const inspirationDie = actor.system.scale.bard.inspiration;
                let secondaryRoll = await new Roll(inspirationDie.formula).evaluate();
                await MidiQOL.displayDSNForRoll(secondaryRoll);

                if (secondaryRoll.total === rollResult) {
                    // player choice
                    spiritItem = await HomebrewHelpers.pickChanneledSpirit(spiritData.slice(0,maxValue));
                }
                else {
                    // choice of two
                    const choices = [];
                    choices.push(spiritData[rollResult - 1]);
                    choices.push(spiritData[secondaryRoll.total - 1]);
                    spiritItem = await HomebrewHelpers.pickChanneledSpirit(choices);
                }
            }
            else {
                const resultData = spiritData[rollResult - 1];
                spiritItem = await fromUuid(resultData.uuid);
            }

            if (spiritItem) {
                let tempItem = spiritItem.toObject();
                await actor.createEmbeddedDocuments('Item',[tempItem]);
                ChatMessage.create({
                    content: `Channeled a ${spiritItem.name}`,
                    speaker: ChatMessage.getSpeaker({actor: actor})
                });
            }
            else {
                ui.notifications.error(`${optionName}: ${version} - error while retrieving the spirit`);
            }
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
