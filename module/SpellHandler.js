const VERSION = "10.0.0";

export class SpellHandler {

    static register() {
        logger.info("%c fvtt-trazzm-homebrew-5e", "color: #D030DE", " | Registering SpellHandler");
        SpellHandler.hooks();
    }

    static hooks() {
        Hooks.on("midi-qol.preAttackRoll", async workflow => {
            // check for Keening Mist and a Necromancy spell
            let keeningMist = game.settings.get("fvtt-trazzm-homebrew-5e", "keening-mist");
            if (keeningMist && workflow.item.system.school === "nec") {
                workflow.advantage = true;
            }
        });

        Hooks.on("midi-qol.AttackRollComplete", async workflow => {
        });

        Hooks.on("midi-qol.RollComplete", async workflow => {
        });
    }
}
