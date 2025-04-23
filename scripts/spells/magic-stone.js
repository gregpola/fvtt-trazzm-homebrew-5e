/*
	You touch one to three pebbles and imbue them with magic. You or someone else can make a ranged spell attack with
	one of the pebbles by throwing it or hurling it with a sling. If thrown, it has a range of 60 feet. If someone else
	attacks with the pebble, that attacker adds your spellcasting ability modifier, not the attacker’s, to the attack
	roll. On a hit, the target takes bludgeoning damage equal to 1d6 + your spellcasting ability modifier. Hit or miss,
	the spell then ends on the stone.
*/
const version = "12.4.0";
const optionName = "Magic Stone";
const stoneItemId = "Compendium.fvtt-trazzm-homebrew-5e.trazzm-automation-items-2024.Item.0u8ljYjM54IRfobN";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const abilityBonus = actor.system.attributes.spellmod;

        let stoneItem = await fromUuid(stoneItemId);
        if (!stoneItem) {
            return ui.notifications.error(`${optionName} - unable to find the magical stone item`);
        }

        let tempItem = stoneItem.toObject();
        tempItem.system.quantity = 3;
        tempItem.system.magicalBonus = abilityBonus;
        await actor.createEmbeddedDocuments('Item', [tempItem]);
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
