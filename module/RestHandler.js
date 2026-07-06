const VERSION = "13.5.0";

export class RestHandler {

    static register() {
        logger.info("%c fvtt-trazzm-homebrew-5e", "color: #D030DE", " | Registering RestHandler");
        RestHandler.hooks();
    }

    static hooks() {
        Hooks.on("dnd5e.restCompleted", async(actor, result, config) => {
            // check for used Arcane Recovery and has Bladesong
            let usedArcaneRecovery = false;

            for (let updateItem of result.updateItems) {
                const item = actor.items.get(updateItem._id);
                if (item && item.name === 'Arcane Recovery') {
                    usedArcaneRecovery = true;
                }
            }

            const bladesongItem = actor.items.getName('Bladesong');
            if (bladesongItem && usedArcaneRecovery) {
                let activity = bladesongItem.system.activities.find(a => a.identifier === 'recovery');
                if (activity) {
                    activity.use();
                }
            }

            // check for Spirits from Beyond
            const spiritsFromBeyond = actor.items.getName("Spirits from Beyond");
            if (spiritsFromBeyond) {
                // remove all spirits
                let channeledSpirits = actor.items.filter(i => i.type === "consumable" && i.identifier.startsWith("spirit-"));
                if (channeledSpirits.length) {
                    const itemIds = Array.from(channeledSpirits).map(t => t.id);
                    await actor.deleteEmbeddedDocuments('Item', itemIds);
                }
            }

        });
    }

    static async wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }

}
