/*
    When a creature you can see hits another creature within 5 feet of you with an attack roll, you can take a Reaction
    to reduce the damage dealt to the target by 1d10 plus your Proficiency Bonus. You must be holding a Shield or a
    Simple or Martial weapon to use this Reaction.
*/
const optionName = "Interception";
const version = "12.4.0";

try {
    if (args[0].macroPass === "preDamageApplication") {
        // -1 is the Interception healing card
        const lastChatMessage = await Array.from(game.messages)[Array.from(game.messages).length-2];

        if (lastChatMessage) {
            // get undo damage array
            const undoDamage = lastChatMessage.flags.midiqol.undoDamage;
            let priorDamage = 0;

            for (let entry of undoDamage) {
                const damage = entry.oldHP - entry.newHP;
                if (damage > 0) {
                    priorDamage += damage;
                }
            }

            if (priorDamage > 0) {
                if (priorDamage < workflow.damageItem.totalDamage) {
                    workflow.damageItem.totalDamage = priorDamage;
                    workflow.damageItem.hpDamage = priorDamage;
                    workflow.damageItem.newHP = workflow.damageItem.oldHP + priorDamage;
                }
            }
            else {
                ui.notifications.error(`${optionName}: ${version} - last damage result didn't apply damage`);
                workflow.damageItem.totalDamage = 0;
                workflow.damageItem.hpDamage = 0;
                workflow.damageItem.newHP = workflow.damageItem.oldHP;
            }
        }
        else {
            ui.notifications.error(`${optionName}: ${version} - unable to locate last damage result. Manually adjust the healing.`);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
