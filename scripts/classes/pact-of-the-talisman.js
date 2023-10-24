/*
    Your patron gives you an amulet, a talisman that can aid the wearer when the need is great. When the wearer fails an
    ability check, they can add a d4 to the roll, potentially turning the roll into a success. This benefit can be used
    a number of times equal to your proficiency bonus, and all expended uses are restored when you finish a long rest.

    If you lose the talisman, you can perform a 1-hour ceremony to receive a replacement from your patron. This ceremony
    can be performed during a short or long rest, and it destroys the previous amulet. The talisman turns to ash when you die.
*/
const version = "11.0";
const optionName = "Pact of the Talisman";

const talismanName = "";
const talismanId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-items.L5aRlj5MgqbJZmiA";

try {
    if (args[0] === "on") {
        // import the talisman if needed
        let talismanItem = await fromUuid(talismanId);
        if (!talismanItem) {
            ui.notifications.error(`${optionName} - unable to find the ${talismanName}`);
            return;
        }

        const itemData = duplicate(talismanItem);
        delete itemData._id;
        itemData.system.equipped = true;
        itemData.system.uses.value = actor.system.attributes.prof;

        const updates = {
            embedded: {
                Item: {
                    [itemData.name]: itemData,
                },
            },
        };
        await warpgate.mutate(token.document, updates, {}, { name: optionName });
        ChatMessage.create({content: actor.name + "'s patron provides them with a talisman"});

    }
    else if (args[0] === "off") {
        let restore = await warpgate.revert(token.document, optionName);
        console.log(`${optionName} - restore == ${restore}`);
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
