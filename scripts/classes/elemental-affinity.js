/*
    Starting at 6th level, when you cast a spell that deals damage with the type associated with your draconic ancestry,
    you can add your Charisma modifier to one damage roll of that spell. At the same time, you can spend 1 sorcery point
    to gain resistance to that damage type for 1 hour.
*/
const version = "11.0";
const optionName = "Elemental Affinity";
const effectName = "Dragon Ancestor Damage Type";

try {
    if ((args[0].macroPass === "postDamageRoll") && (workflow.item.type === "spell")) {
        // get the Dragon Ancestor effect
        const dragonAncestorEffect = actor.appliedEffects.find(eff => eff.name === effectName);
        if (dragonAncestorEffect) {
            // get the damage type
            const dragonDamageType = dragonAncestorEffect.changes[0]?.value?.trim();
            if (dragonDamageType) {
                // get the spell damage types
                let matchingDamageIndex = -1;
                let damageParts = workflow.item.system.damage.parts;
                for (let i = 0; i < damageParts.length; i++) {
                    if (damageParts[i][1] && damageParts[i][1] === dragonDamageType) {
                        matchingDamageIndex = i;
                        break;
                    }
                }

                if (matchingDamageIndex > -1) {
                    // Skip if they already have resistance
                    let resistant = actor.system.traits.dr.value.has(dragonDamageType);
                    if (!resistant) {
                        // check for remaining sorcery points
                        let sorceryPoints = HomebrewHelpers.getAvailableSorceryPoints(actor);

                        // ask the player if they want to gain resistance
                        if (sorceryPoints) {
                            let content = `
                            <div class="form-group">
                              <label>Do you want to spend 1 sorcery point to gain ${dragonDamageType} resistance for 1 hour?</label>
                              <br />
                            </div>`;

                            let d = await new Promise((resolve) => {
                                new Dialog({
                                    title: optionName,
                                    content,
                                    buttons: {
                                        OK: {
                                            label: "Yes",
                                            callback: async (html) => {
                                                resolve(true);
                                            }
                                        },
                                        Cancel: {
                                            label: `No`,
                                            callback: async (html) => {
                                                resolve(false);
                                            }
                                        }
                                    }
                                }).render(true);
                            });

                            let proceed = await d;
                            if (proceed) {
                                let effectDataResistance = {
                                    name: optionName + " - Damage Resistance",
                                    icon: item.img,
                                    origin: item.uuid,
                                    changes: [
                                        {
                                            key: `system.traits.dr.value`,
                                            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                                            value: `${dragonDamageType}`,
                                            priority: 20
                                        }
                                    ],
                                    disabled: false,
                                    duration: {
                                        seconds: 3600
                                    },
                                    flags: {}
                                };
                                await MidiQOL.socket().executeAsGM("createEffects", {
                                    actorUuid: actor.uuid,
                                    effects: [effectDataResistance]
                                });
                                await HomebrewHelpers.reduceAvailableSorceryPoints(actor, 1)
                            }
                        }
                    }

                    // add damage bonus
                    const damageBonus = Math.max(0, actor.system.abilities.cha.mod);
                    workflow.damageRolls[matchingDamageIndex] = await addToRoll(workflow.damageRolls[matchingDamageIndex], damageBonus);
                    await workflow.setDamageRolls(workflow.damageRolls);
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function addToRoll(roll, addonFormula) {
    let addonFormulaRoll = await new Roll('0 + ' + addonFormula).evaluate({'async': true});
    game.dice3d?.showForRoll(addonFormulaRoll);
    for (let i = 1; i < addonFormulaRoll.terms.length; i++) {
        roll.terms.push(addonFormulaRoll.terms[i]);
    }
    roll._total += addonFormulaRoll.total;
    roll._formula = roll._formula + ' + ' + addonFormula;
    return roll;
}
