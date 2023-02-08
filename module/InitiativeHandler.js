const VERSION = "10.0.0";

export class InitiativeHandler {

    static register() {
        logger.info("fvtt-trazzm-homebrew-5e | ", "Registering InitiativeHandler");
        InitiativeHandler.hooks();
    }

    static hooks() {
        Hooks.on("dnd5e.preRollInitiative", (actor, roll) => {

        });

        Hooks.on("dnd5e.rollInitiative", async(actor, combatants) => {
            // look for relentless
            let featureItem = actor?.items?.getName("Relentless");
            if (featureItem) {
                // add a superiority die if they don't have any left
                let resKey = InitiativeHandler.findResource(actor, "Superiority Dice");
                if (resKey) {
                    let resources = actor.system.resources;
                    if (resources[resKey].value < 1) {
                        resources[resKey].value = 1;
                        actor.update({ "system.resources": resources });
                        await InitiativeHandler.wait(500);
                    }
                }
            }

            // Look for Perfect Self
            featureItem = actor?.items?.getName("Perfect Self");
            if (featureItem) {
                // At 20th level, when you roll for initiative and have no ki points remaining, you regain 4 ki points.
                let resKey = InitiativeHandler.findResource(actor, "Ki Points");
                if (resKey) {
                    let resources = actor.system.resources;
                    if (resources[resKey].value < 1) {
                        resources[resKey].value = 4;
                        actor.update({ "system.resources": resources });
                        await InitiativeHandler.wait(500);
                    }
                }
            }

        });
    }

    static async wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }

    static findResource(actor, resourceName) {
        if (actor) {
            for (let res in actor.system.resources) {
                if (actor.system.resources[res].label === resourceName) {
                    return res;
                }
            }
        }

        return null;
    }
}
