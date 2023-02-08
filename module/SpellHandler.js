const VERSION = "10.0.0";

export class SpellHandler {

    static register() {
        logger.info("fvtt-trazzm-homebrew-5e | ", "Registering SpellHandler");
        SpellHandler.hooks();
    }

    static hooks() {
        Hooks.on("midi-qol.RollComplete", async workflow => {
        });
    }
}
