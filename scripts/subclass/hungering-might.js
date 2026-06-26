/*
    In addition, once per turn when you hit a creature with an attack roll while you are transformed using Wrath of the
    Wild, you regain a number of Hit Points equal to 1d10 plus your Wisdom modifier, provided you are Bloodied when you hit.
*/
const optionName = "Hungering Might";
const version = "14.5.0";
const timeFlag = "hungering-might-time";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postDamageRoll") {
        const inWrath = HomebrewEffects.findEffect(actor, "Wrath of the Wild");
        const bloodied = HomebrewEffects.findEffect(actor, "Bloodied");

        if (workflow.hitTargets.size > 0 && inWrath && bloodied) {
            if (HomebrewHelpers.perTurnCheck(actor, timeFlag)) {
                const wisdomMod = actor.system.abilities.wis.mod;

                const damageRoll = await new CONFIG.Dice.DamageRoll(`1d10 + ${wisdomMod}`, {}, {type: "healing", properties: ["mgc"]}).evaluate();
                await new MidiQOL.DamageOnlyWorkflow(actor, token, null, null, [token], damageRoll, {
                    flavor: optionName,
                    itemCardId: "new",
                    itemData: macroItem.toObject()
                });

                await HomebrewHelpers.setTurnCheck(workflow.actor, timeFlag);
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
