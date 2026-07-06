/*
    As a Bonus Action, you can expend a use of your Bardic Inspiration and channel a specific spirit. When you do so,
    choose the spirit from the Spirits from Beyond table rather than rolling. The chosen spirit’s corresponding number
    must be less than or equal to the highest number on your Bardic Inspiration die; for example, if your Bardic
    Inspiration die is a d8, you can choose to channel any spirit up to (and including) the Shade.
*/
const version = "14.5.0";
const optionName = "Spirits from Beyond - Controlled Channeling";

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
    if (args[0].macroPass === "postActiveEffects") {
        // ask which spirit to channel
        const maxValue = actor.system.scale.bard.inspiration.faces;
        const spiritItem = await HomebrewHelpers.pickChanneledSpirit(spiritData.slice(0,maxValue));

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

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
