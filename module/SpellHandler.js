const VERSION = "10.0.0";

export class SpellHandler {

    static register() {
        logger.info("%c fvtt-trazzm-homebrew-5e", "color: #D030DE", " | Registering SpellHandler");
        SpellHandler.hooks();
    }

    static hooks() {
        Hooks.on("midi-qol.preAttackRoll", async workflow => {
        });

        Hooks.on("midi-qol.AttackRollComplete", async workflow => {
        });

        Hooks.on("midi-qol.RollComplete", async workflow => {
        });
    }
}
