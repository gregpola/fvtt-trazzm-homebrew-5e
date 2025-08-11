/*
    You conjure spirits from the Elemental Planes that flit around you in a 15-foot Emanation for the duration. Until
    the spell ends, any attack you make deals an extra 2d8 damage when you hit a creature in the Emanation. This damage
    is Acid, Cold, Fire, or Lightning (your choice when you make the attack).

    In addition, the ground in the Emanation is Difficult Terrain for your enemies.

    Using a Higher-Level Spell Slot. The damage increases by 2d8 for each spell slot level above 4.
*/
const optionName = "Conjure Minor Elementals";
const version = "12.4.0";
const auraEffectName = "CME - Aura (In Aura)";
const damageTypes = [['🧪 Acid', 'acid'], ['❄️ Cold', 'cold'], ['🔥 Fire', 'fire'], ['⚡ Lightning', 'lightning']];

try {
    if (args[0].macroPass === "DamageBonus") {
        if (!workflow.hitTargets.size) return {};

        if (["mwak", "rwak", "msak", "rsak"].includes(workflow.item.system.actionType)) {
            let targetToken = workflow.hitTargets.first();
            const auraEffects = targetToken.actor.effects.filter(e => e.name === auraEffectName);

            if (auraEffects.length > 0) {
                for (let auraEffect of auraEffects) {
                    let auraOrigin = await fromUuid(auraEffect.origin);
                    if (auraOrigin === actor) {
                        const castLevel = auraEffect.flags["midi-qol"].castData.castLevel;
                        const damageDice = 2 + ((castLevel - 4) * 2);

                        // build the dialog content
                        let content = `<p>Choose the ${optionName} damage type for this attack:</p>`;
                        let first = true;
                        for (let dt of damageTypes) {
                            if (first) {
                                content += `<label style="margin-left: 15px; margin-bottom: 5px;"><input style="right: 10px;" type="radio" name="choice" value="${dt[1]}" checked />${dt[0]}</label>`;
                                first = false;
                            }
                            else {
                                content += `<label style="margin-left: 15px; margin-bottom: 5px;"><input style="right: 10px;" type="radio" name="choice" value="${dt[1]}" />${dt[0]}</label>`;
                            }
                        }
                        content += '<div style="margin-bottom: 10px;" />';

                        // prompt the player
                        let damageType = await foundry.applications.api.DialogV2.prompt({
                            content: content,
                            rejectClose: false,
                            ok: {
                                callback: (event, button, dialog) => {
                                    return button.form.elements.choice.value;
                                }
                            },
                            window: {
                                title: `${optionName}`,
                            },
                            position: {
                                width: 400
                            }
                        });

                        if (damageType) {
                            return new CONFIG.Dice.DamageRoll(`${damageDice}d8[${damageType}]`, {}, {
                                type: damageType,
                                properties: [...rolledItem.system.properties]
                            });
                        }
                    }
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
