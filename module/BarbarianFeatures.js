export class BarbarianFeatures {

    static register() {
        logger.info("%c fvtt-trazzm-homebrew-5e", "color: #D030DE", " | Registering BarbarianFeatures");
        BarbarianFeatures.hooks();
    }

    static hooks() {
        Hooks.on("midi-qol.preAttackRoll", async workflow => {
        });

        Hooks.on("midi-qol.preDamageRollComplete", async workflow => {
        });

        Hooks.on("midi-qol.damageApplied", async (token, {item, workflow, ditem}) => {
        });
    }
}
