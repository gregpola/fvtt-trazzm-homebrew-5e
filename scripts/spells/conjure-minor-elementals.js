/*
    You conjure spirits from the Elemental Planes that flit around you in a 15-foot Emanation for the duration. Until
    the spell ends, any attack you make deals an extra 2d8 damage when you hit a creature in the Emanation. This damage
    is Acid, Cold, Fire, or Lightning (your choice when you make the attack).

    In addition, the ground in the Emanation is DifficultTerrain for your enemies.

    Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 4.
*/
const optionName = "Conjure Minor Elementals";
const version = "13.5.0";
const auraEffectName = "Minor Elementals Aura";
const damageTypes = [['🧪 Acid', 'acid'], ['❄️ Cold', 'cold'], ['🔥 Fire', 'fire'], ['⚡ Lightning', 'lightning']];

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "preDamageRoll") {
        if (["mwak", "rwak", "msak", "rsak"].includes(rolledActivity.actionType)) {
            let targetToken = workflow.hitTargets.first();
            if (targetToken) {
                const auraEffects = targetToken.actor.effects.filter(e => e.name === auraEffectName);

                if (auraEffects.length > 0) {
                    for (let auraEffect of auraEffects) {
                        let auraOrigin = await fromUuid(auraEffect.origin);
                        if (auraOrigin.parent === actor) {
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
                                // apply damage bonus
                                await applyDamageBonus(actor, damageType, damageDice);
                            }
                        }
                    }
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyDamageBonus(actor, damageType, damageDice) {
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
                'value': `bonus=${damageDice}d8[${damageType}]; once;`,
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
