export class WarlockFeatures {

    static register() {
        logger.info("%c fvtt-trazzm-homebrew-5e", "color: #D030DE", " | Registering WarlockFeatures");
        WarlockFeatures.hooks();
    }

    static hooks() {
        Hooks.on("midi-qol.damageApplied", async (token, {item, workflow, ditem}) => {
            // get the actor
            let actor = workflow.actor;
            if (!actor) return;

            let warlockLevels = actor?.classes.warlock?.system.levels ?? 0;

            // get the target
            let targetActor = token?.document?.actor;
            if (!targetActor) {
                targetActor = token?.actor;
            }
            if (!targetActor) return;

            // check for Dark One’s Blessing
            // Starting at 1st level, when you reduce a hostile creature to 0 hit points, you gain temporary hit points equal to your Charisma modifier + your warlock level (minimum of 1).
            let featureItem = actor.items.getName("Dark One’s Blessing");
            if (featureItem) {
                if (ditem.newHP < 1) {
                    let newTemp = Math.max(1, warlockLevels + actor.system.abilities.cha.mod);
                    let oldTemp = actor.system.attributes.hp.temp;

                    if (newTemp > oldTemp) {
                        actor.update({ "system.attributes.hp.temp": newTemp });
                    }
                }
            }
        });
    }

    static async wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
}
