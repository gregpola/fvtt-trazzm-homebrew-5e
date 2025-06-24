/*
    The healing spells you cast on others heal you as well. Immediately after you cast a spell with a spell slot that
    restores Hit Points to one or more creatures other than yourself, you regain Hit Points equal to 2 plus the spell
    slot's level.
*/
const optionName = "Blessed Healer";
const version = "12.4.0";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postActiveEffects") {
        if (rolledItem.type === "spell" && rolledActivity.healing !== undefined) {
            // make sure the caster wasn't targeted
            if (workflow.targets.has(token)) {
                console.log(`${optionName} - caster was a target`);
                return;
            }

            // make sure it's a first or higher level spell
            const spellLevel = workflow.castData.castLevel;
            if (spellLevel > 0) {
                const healAmount = 2 + spellLevel;
                const damageRoll = await new CONFIG.Dice.DamageRoll(`${healAmount}`, {}, {type: "healing", properties: ["mgc"]}).evaluate();
                await new MidiQOL.DamageOnlyWorkflow(actor, token, null, null, [token], damageRoll, {
                    flavor: optionName,
                    itemCardId: "new",
                    itemData: macroItem.toObject()
                });
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
