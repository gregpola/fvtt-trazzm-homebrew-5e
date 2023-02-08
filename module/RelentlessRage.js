const NAME = "RelentlessRage";
const VERSION = "10.0.0";
const ITEM_NAME = "Relentless Rage";

export class RelentlessRage {

    static register() {
        logger.info("fvtt-trazzm-homebrew-5e | ", "Registering Relentless Rage");
        RelentlessRage.hooks();
    }

    static hooks() {
        Hooks.on("midi-qol.damageApplied", async (token, {item, workflow, ditem}) => {
            let targetActor = token?.document?.actor;
            if (!targetActor) {
                targetActor = token?.actor;
            }
            if (!targetActor) return;

            // Bail if the target actor does not have Relentless Rage
            let featureItem = targetActor.items.getName(ITEM_NAME);
            if (featureItem) {
                // Bail if the actor is not raging
                let rageEffect = targetActor.effects.find(i => i.label === "Rage");
                if (rageEffect) {
                    if (ditem.newHP < 1) {
                        // Roll the actor's con save
                        const featureValue = featureItem.system.uses?.value ?? 1;
                        const targetValue = (10 + (5 * featureValue));
                        let saveRoll = await targetActor.rollAbilitySave("con", {flavor: ITEM_NAME + " - DC " + targetValue});
                        await game.dice3d?.showForRoll(saveRoll);
                        if (saveRoll.total >= targetValue) {
                            ditem.totalDamage = ditem.hpDamage = ditem.appliedDamage = ditem.oldHP - 1;
                            ditem.newHP = 1;
                        }

                        await featureItem.update({ "system.uses.value": featureValue + 1 });
                        await RelentlessRage.wait(500);
                    }
                }
            }
        });
    }

    static async wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
}
