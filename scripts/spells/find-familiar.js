/*
    Adds the Generic Actions item to the summoned familiar
*/
const optionName = "Find Familiar";
const version = "14.5.1";
const genericActionsItemId = "Compendium.fvtt-trazzm-homebrew-5e.trazzm-backgrounds-2024.Item.ZvvxIAbA5M2I55D7";

try {
    if (args[0].macroPass === "preItemRoll") {
        Hooks.once("dnd5e.postSummon", async(activity, profile, tokens, options) => {
            const genericActionsItem = fromUuidSync(genericActionsItemId);
            if (genericActionsItem) {
                for (let t of tokens) {
                    await t.actor.createEmbeddedDocuments('Item', [genericActionsItem]);
                }
            }
        });
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
