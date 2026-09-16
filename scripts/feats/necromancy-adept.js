/**
 * Life Manipulation. When you cast a spell from the Necromancy school using a spell slot, you can immediately roll up
 * to two of your unexpended Hit Point Dice. You regain Hit Points equal to the total rolled plus the level of spell
 * slot expended. Those Hit Point Dice are then expended.
 */
const optionName = "Necromancy Adept";
const version = "14.5.0";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postActiveEffects" && rolledItem.type === "spell" && rolledItem.system.school === "nec") {
        const spellLevel = workflow.castData.castLevel;

        // make sure it was cast using a spell slot???
        if (spellLevel > 0 && rolledActivity.consumption?.spellSlot) {
            // check available hit dice
            const availableHitDice = HomebrewHelpers.getAvailableHitDice(actor);
            if (availableHitDice > 0) {
                // prompt for use
                let description = `<div><h4>${optionName}</h4></div>`;
                description += `<div style="white-space: pre-wrap;">You can select up to 2 hit dice to expend and gain hit points equal to the total rolled plus the level of spell slot expended</div>`;
                const result = await TrazzmHomebrew.dialogUtils.selectHitDie(actor, description, {max: 2});

                if (result) {
                    let healingRoll = '';

                    for (const record of result) {
                        if (record.amount > 0) {
                            var newSpent = record.document.system.hd.spent + record.amount;
                            await record.document.update({"system.hd.spent": newSpent});

                            if (healingRoll.length > 0) {
                                healingRoll += ' + ';
                            }
                            healingRoll += `${record.amount}${record.document.system.hd.denomination}`;
                        }
                    }

                    if (healingRoll.length > 0) {
                        healingRoll += ` + ${spellLevel}`;

                        const damageRoll = await new CONFIG.Dice.DamageRoll(`${healingRoll}`, {}, {type: "healing", properties: ["mgc"]}).evaluate();
                        await new MidiQOL.DamageOnlyWorkflow(actor, token, null, null, [token], damageRoll, {
                            flavor: "Life Manipulation",
                            itemCardId: "new",
                            itemData: macroItem.toObject()
                        });
                    }
                }
            }

        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
