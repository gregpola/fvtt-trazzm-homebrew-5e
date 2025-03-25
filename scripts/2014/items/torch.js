/*
    When the torch is lit, it will summon a temporary item to the character
*/
const version = "11.0";
const optionName = "Torch";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "torch-flag";
const litTorchName = "Torch (Lit)";
const litTorchId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-items.R1Y63OTHEkKaRuTR";

try {
    if (args[0] === "on") {
        // import the lit torch item if not already imported
        let torchItem = game.items.getName(litTorchName);
        if (!torchItem) {
            torchItem = await fromUuid(litTorchId);
            if (!torchItem) {
                ui.notifications.error(`${litTorchName} - unable to find the lit torch item`);
                return;
            }
        }

        let tempItem = torchItem.toObject();
        const items = await actor.createEmbeddedDocuments('Item',[tempItem]);
        if (items && items[0]) {
            await actor.setFlag(_flagGroup, flagName, items[0].id);
        }

    }
    else if (args[0] === "off") {
        // delete the lit torch
        const litTorch = actor.getFlag(_flagGroup, flagName);
        if (litTorch) {
            await actor.unsetFlag(_flagGroup, flagName);
            await actor.deleteEmbeddedDocuments('Item',[litTorch]);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
