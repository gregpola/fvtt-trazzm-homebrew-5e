/**
 * Fueled Evocation. Once per turn when you cast an Evocation spell and deal damage, you can roll up to two of your
 * unexpended Hit Point Dice and add the total rolled to one of the spell’s damage rolls. Those Hit Point Dice are then
 * expended.
 */
const optionName = "Evocation Adept";
const version = "14.5.0";
const timeFlag = "fueled-evocation-time";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "preDamageRoll") {
        const targetToken = workflow.hitTargets.first();

        if (game.combat && targetToken && rolledItem.type === "spell" && rolledItem.system.school === "evo" && HomebrewHelpers.isAvailableThisTurn(actor, timeFlag)) {
            // check available hit dice
            const availableHitDice = HomebrewHelpers.getAvailableHitDice(actor);
            if (availableHitDice > 0) {
                // prompt for use
                let description = `<div><h4>${optionName}</h4></div>`;
                description += `<div style="white-space: pre-wrap;">You can select up to 2 hit dice to expend and add them to the damage of ${rolledItem.name}</div>`;
                const result = await TrazzmHomebrew.dialogUtils.selectHitDie(actor, description, {max: 2});

                if (result) {
                    let damageBonusRoll = '';

                    for (const record of result) {
                        if (record.amount > 0) {
                            var newSpent = record.document.system.hd.spent + record.amount;
                            await record.document.update({"system.hd.spent": newSpent});

                            if (damageBonusRoll.length > 0) {
                                damageBonusRoll += ' + ';
                            }
                            damageBonusRoll += `${record.amount}${record.document.system.hd.denomination}`;
                        }
                    }

                    if (damageBonusRoll.length > 0) {
                        // set used and return the damage bonus
                        await HomebrewHelpers.setUsedThisTurn(actor, timeFlag);
                        await applyDamageBonus(actor, workflow.defaultDamageType, damageBonusRoll);
                    }
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyDamageBonus(actor, damageType, damageBonusRoll) {
    let effectData = {
        name: `${optionName} - damage bonus`,
        icon: macroItem.img,
        origin: macroItem.uuid,
        type: "base",
        transfer: false,
        statuses: [],
        changes: [
            {
                'key': 'flags.automated-conditions-5e.damage.bonus',
                'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                'value': `bonus=${damageBonusRoll}[${damageType}]; once;`,
                'priority': 20
            }
        ]
    };

    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effectData] });
}
