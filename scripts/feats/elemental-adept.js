/*
    Choose one of the following damage types: Acid, Cold, Fire, Lightning, or Thunder. Spells you cast ignore Resistance
    to damage of the chosen type. In addition, when you roll damage for a spell you cast that deals damage of that type,
    you can treat any 1 on a damage die as a 2.

    To apply to other damage type, just copy this script and replace the damageType string in the feature
*/
const version = "12.4.0";
const damageType = "acid";
const optionName = `Elemental Adept (${damageType})`;

const ignoreResistanceEffectData = {
    name: `${optionName} - ignore resistance`,
    icon: 'icons/magic/symbols/elements-air-earth-fire-water.webp',
    changes:[{
        key: 'system.traits.dr.value',
        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
        value: `-${damageType}`
    }],
    flags: {dae: { specialDuration: ['isDamaged']} }
};

try {
    // we only care about spells of this damage type
    if (rolledItem.type === "spell" && rolledItem.system.damage.parts.map(i=>i[1]).includes(damageType)) {
        if (args[0].tag === "OnUse" && args[0].macroPass === "preDamageRoll") {
            // apply ignore resistance
            for (let target of workflow.targets) {
                let resistant = target.actor.system.traits.dr.value.has(damageType);
                if (resistant) {
                    await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: target.actor.uuid, effects: [ignoreResistanceEffectData]});
                }
            }

            // update damage rolls to min2
            Hooks.once('dnd5e.preRollDamageV2', (rollConfig, dialogConfig, messageConfig) => {
                if (rollConfig?.workflow?.id !== workflow.id) {
                    // Different activity workflow, remove hook
                    if (debug) {
                        console.warn(`${DEFAULT_ITEM_NAME} | dnd5e.preRollDamageV2 called on different workflow`, {
                            rollConfig,
                            dialogConfig,
                            messageConfig,
                        });
                    }
                    return;
                }

                // Get only base spell rolls
                const rolls = rollConfig.rolls?.filter((r) => r.options.type === damageType) ?? [];
                for (let roll of rolls) {
                    if (!roll.parts?.length) {
                        continue;
                    }

                    for (let i = 0; i < roll.parts.length; i++) {
                        roll.parts[i] = addModifiers(roll.parts[i], "min2");
                    }
                }
            });

        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

function addModifiers(formula, ...modifiers) {
    const roll = new Roll(formula);
    for (let die of roll.dice) {
        die.modifiers.push(...modifiers);
    }
    return roll.formula;
}
