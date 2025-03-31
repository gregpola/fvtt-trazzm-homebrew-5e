/*
    When you roll damage for an attack you make with a Melee weapon that you are holding with two hands, you can treat
    any 1 or 2 on a damage die as a 3. The weapon must have the Two-Handed or Versatile property to gain this benefit.
*/
const version = "12.4.0";
const optionName = "Great Weapon Fighting";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "preDamageRoll") {
        // check action eligibility
        if (rolledItem.type === "weapon"
            &&  ['simpleM', 'martialM'].includes(rolledItem.system.type?.value)
            && workflow.activity?.hasAttack
            && workflow.activity.attack.type?.classification === 'weapon'
            && (rolledItem.system.properties?.has('two') || rolledItem.system.properties?.has('ver'))) {

            // update damage rolls to min3
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

                if (rollConfig.attackMode !== 'twoHanded') {
                    if (debug) {
                        console.warn(`${DEFAULT_ITEM_NAME} | dnd5e.preRollDamageV2 attackMode was not twoHanded`, {
                            rollConfig,
                            dialogConfig,
                            messageConfig,
                        });
                    }
                    return;
                }

                // Get only base spell rolls
                const rolls = rollConfig.rolls?.filter((r) => r.base) ?? [];
                for (let roll of rolls) {
                    if (!roll.parts?.length) {
                        continue;
                    }
                    for (let i = 0; i < roll.parts.length; i++) {
                        roll.parts[i] = addModifiers(roll.parts[i], "min3");
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
