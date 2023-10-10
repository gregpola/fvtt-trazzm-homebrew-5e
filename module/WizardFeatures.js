const VERSION = "10.0.0";

export class WizardFeatures {

    static register() {
        logger.info("%c fvtt-trazzm-homebrew-5e", "color: #D030DE", " | Registering WizardFeatures");
        WizardFeatures.hooks();
    }

    static hooks() {
        Hooks.on("midi-qol.preCheckHits", async workflow => {
            logger.info("midi-qol.preCheckHits");

            // get the actor
            let actor = workflow.actor;

            // check for Portent
            if (actor) {
                let portentDie = WizardFeatures.getPortentDie(actor);
                if (portentDie) {
                    let dieTerm = workflow.attackRoll.terms[0];
                    let itemRollData = actor.items.get(workflow.item.id).getRollData();
                    let rollExpression = `${portentDie} + ${itemRollData.mod} + ${itemRollData.prof.flat}`;
                    workflow.setAttackRoll(await new Roll(rollExpression).evaluate());

                    // check for critical and fumble
                    if (portentDie === 20) {
                        foundry.utils.setProperty(workflow.rollOptions, "critical", true);
                    }
                    if (portentDie === 1) {
                        foundry.utils.setProperty(workflow.rollOptions, "fumble", true);
                    }

                    ChatMessage.create({
                        speaker: {alias: workflow.actor.name},
                        content: 'Portent changes the attack roll to: ' + portentDie
                    });
                }
            }
        });

    }

    static getPortentDie(actor) {
        let portentEffect = actor.effects?.find(f => f.name === "Portent");
        if (portentEffect) {
            return portentEffect.flags['trazzm']?.portentRoll;
        }
        return null;
    }

    static async wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
}
