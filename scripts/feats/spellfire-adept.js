/*
    Fueled Spellfire. Once per turn, when a spell you cast deals Radiant damage, you can expend up to two Hit Point Dice,
    roll them, and add the total rolled to one damage roll of the spell.
 */
const optionName = "Fueled Spellfire";
const version = "13.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const damageBonus = workflow.utilityRoll.total;
        if (damageBonus > 0) {
            await applyDamageBonus(actor, damageBonus);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyDamageBonus(actor, damageBonus) {
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
                'value': `bonus=${damageBonus}; once; isSpell && damageTypes.radiant`,
                'priority': 20
            }
        ],
        flags: {
            dae: {
                stackable: 'noneName',
                specialDuration: ['turnStartSource', 'DamageDealt', 'combatEnd']
            }
        }
    };

    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effectData] });
}
