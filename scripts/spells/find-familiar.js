/*
    Adds the Generic Actions item to the summon
*/
const optionName = "Find Familiar";
const version = "14.5.0";
const genericActionsItemId = "Compendium.fvtt-trazzm-homebrew-5e.trazzm-backgrounds-2024.Item.ZvvxIAbA5M2I55D7";

try {
    if (args[0].macroPass === "preItemRoll") {
        Hooks.once("dnd5e.postSummon", (activity, profile, tokens, options) => {
            let genericActionsItem = fromUuidSync(genericActionsItemId);
            if (genericActionsItem) {
                let tempItem = genericActionsItem.toObject();

                for (let t of tokens) {
                    t.actor.createEmbeddedDocuments('Item', [tempItem]);
                }
            }
        });
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
