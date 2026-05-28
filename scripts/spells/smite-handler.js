 /*
    A general handler for all 'Smite' spells. This is to minimize the number of dialog's that popup for an actor with
    multiple smite spells.
 */
const optionName = "Smite Handler";
const version = "14.5.0";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "preDamageRoll") {
        let targetToken = workflow.hitTargets.first();

        // make sure it's an eligible attack
        if (targetToken && (rolledActivity.actionType === "mwak") && !MidiQOL.hasUsedBonusAction(actor)) {
            // collect the actor's smite spells
            let smiteSpells = actor.items.filter(i => i.type === 'spell' && i.name.endsWith(' Smite'));
            if (smiteSpells.length > 0) {
                // sort by level and alpha
                smiteSpells.sort((a, b) => {
                    // Primary sort: Age (Ascending)
                    if (a.system.level !== b.system.level) {
                        return a.system.level - b.system.level;
                    }

                    // Secondary sort: Name (Lexicographical)
                    if (a.name !== b.name) {
                        return a.name.localeCompare(b.name);
                    }

                    return 0;
                });

                const spellData = foundry.utils.duplicate(actor.getRollData().spells);
                let spellSlotData = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0};
                let slotsDisplay = '';

                for (let [key, {level, value, max}] of Object.entries(spellData)) {
                    if (max > 0) {
                        if (slotsDisplay.length > 0) {
                            slotsDisplay += ', ';
                        }
                        slotsDisplay += `L${level}: ${value}/${max}`;

                        if (value > 0) {
                            spellSlotData[level] = value;
                        }
                    }
                }

                let content = `<p>Available smite spells for this attack:</p>`;
                let optionsCount = 0;
                let spell_content = ``;
                for (let spell of smiteSpells) {
                    let limitedUse = false;
                    if (spell.hasLimitedUses && spell.system.uses.max > 0 && spell.system.uses.spent < spell.system.uses.max) {
                        limitedUse = true;
                    }

                    if (limitedUse || hasSlotsForSpell(spell, spellSlotData)) {
                        if (limitedUse) {
                            spell_content += `<option value=${spell.id}>L${spell.system.level} - ${spell.name} (free use available)</option>`;
                        }
                        else {
                            spell_content += `<option value=${spell.id}>L${spell.system.level} - ${spell.name}</option>`;
                        }
                        optionsCount++;
                    }
                }
                content += `<p style="margin-bottom: 5px;"><select name="spells">${spell_content}</select></p>`;
                content += `<p>Available spell slots:<br>${slotsDisplay}</p>`;

                if (optionsCount > 0) {
                    content += '<div style="margin-bottom: 5px;" />';

                    const result = await foundry.applications.api.DialogV2.wait({
                        window: { title: "Apply a Smite Spell?" },
                        form: { closeOnSubmit: true },
                        content: content,
                        buttons: [
                            {
                                action: "Cast",
                                default: true,
                                label: "Cast",
                                callback: (event, button, dialog) => {
                                    return button.form.elements.spells.value
                                }
                            },
                            {
                                action: "Pass",
                                default: false,
                                label: "Pass",
                                callback: () => "Pass"
                            },
                        ],
                        rejectClose: false,
                        modal: true,
                        position: {
                            width: 400
                        }
                    });

                    if (result === null || result === "Pass") {
                        return;
                    }

                    // cast the chosen spell
                    const selectedSpell = actor.items.find(i => i.id === result);
                    if (selectedSpell) {
                        let activity = selectedSpell.system.activities.getName("Smite Damage");
                        if (activity) {
                            const options = {
                                midiOptions: {
                                    targetUuids: [actor.uuid],
                                    noOnUseMacro: false,
                                    configureDialog: true,
                                    showFullCard: false,
                                    ignoreUserTargets: true,
                                    checkGMStatus: true,
                                    autoRollAttack: true,
                                    autoRollDamage: "always",
                                    fastForwardAttack: true,
                                    fastForwardDamage: true,
                                    workflowData: true
                                }
                            };

                            await MidiQOL.completeActivityUse(activity.uuid, options, {}, {});
                        }
                        else {
                            ui.notifications.error(`${optionName}: ${version} - missing Smite Damage activity in ${spell.name}`);
                        }
                    }
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

function hasSlotsForSpell(spell, spellSlotData) {
    // check preparation first
    if (spell.system.preparation.mode === 'prepared' && !spell.system.preparation.prepared) {
        console.debug(`${spell.name} is not prepared`);
        return false;
    }

    for (let slot = spell.system.level; slot <= 9; slot++) {
        if (spellSlotData[slot] > 0) {
            return true;
        }
    }

    return false;
}
