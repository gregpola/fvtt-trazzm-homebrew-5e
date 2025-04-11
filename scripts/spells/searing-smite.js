/*
    As you hit the target, it takes an extra 1d6 Fire damage from the attack. At the start of each of its turns until
    the spell ends, the target takes 1d6 Fire damage and then makes a Constitution saving throw. On a failed save, the
    spell continues. On a successful save, the spell ends.

    Using a Higher-Level Spell Slot. All the damage increases by 1d6 for each spell slot level above 1.
*/
const version = "12.4.0";
const optionName = "Searing Smite";
const effectName = "Searing Smite burning";

try {
    if (args[0].macroPass === "DamageBonus") {
        let targetToken = workflow.hitTargets.first();

        // check for free use
        let freeUseFeature = undefined;
        if (macroItem.hasLimitedUses && macroItem.system.uses.max > 0 && macroItem.system.uses.spent < macroItem.system.uses.max) {
            freeUseFeature = {
                spent: macroItem.system.uses.spent,
                max: macroItem.system.uses.max
            };
        }

        // check prepared
        if (!freeUseFeature && macroItem.system.preparation.mode === 'prepared' && !macroItem.system.preparation.prepared && macroItem.system.level > 0)
            return {};

        if (targetToken && (macroActivity.actionType === "mwak") && !MidiQOL.hasUsedBonusAction(actor)) {
            const spellData = foundry.utils.duplicate(actor.getRollData().spells);
            let spellLevelRows = "";

            for (let [key, {level, value, max}] of Object.entries(spellData)) {
                if (value > 0 && max > 0 && level >= macroItem.system.level) {
                    spellLevelRows += `<option value=${key}>${CONFIG.DND5E.spellLevels[level]} (slots: ${value}, max: ${max})</option>`;
                }
            }

            // check for no uses available
            if (!freeUseFeature && (spellLevelRows.length === 0)) return {};

            // build the dialog content
            let content = `<p style="margin-bottom: 10px;">Add ${optionName} damage to this attack?</p>`;

            if (spellLevelRows.length > 0) {
                content += `<label><input style="right: 10px;" type="radio" name="choice" value="slot" checked />Use Spell Slot:</label>`;
                content += `<div style="margin-bottom: 10px;"><select name="slotChoice">${spellLevelRows}</select></div>`;
            }

            if (freeUseFeature) {
                content += `<label style="margin-bottom: 10px;"><input style="right: 10px;" type="radio" name="choice" value="limited"/>Use Limited Use (spent: ${freeUseFeature.spent}, max: ${freeUseFeature.max})</label>`;
            }
            content += '</div></form>';

            // ask if they want to use it
            let optionSelected = await foundry.applications.api.DialogV2.prompt({
                content: content,
                rejectClose: false,
                modal: true,
                ok: {
                    callback: (event, button, dialog) => {
                        var usageChoice = button.form.elements.choice.value;
                        if (usageChoice === "slot") {
                            return {option: usageChoice, slot: button.form.elements.slotChoice.value};
                        } else {
                            return {option: usageChoice, slot: undefined};
                        }
                    }
                },
                window: {
                    title: `${optionName}`,
                },
                position: {
                    width: 400
                }
            });

            // make sure they didn't select a different smite option
            if (optionSelected && !MidiQOL.hasUsedBonusAction(actor)) {
                let spellLevel = 1;

                if (optionSelected.option === "slot") {
                    // get the spell level
                    let valueKey = 'system.spells.' + optionSelected.slot + '.value';
                    let currentValue = foundry.utils.getProperty(actor, valueKey);
                    let levelKey = 'system.spells.' + optionSelected.slot + '.level';
                    spellLevel = foundry.utils.getProperty(actor, levelKey);

                    // burn the spell slot
                    await actor.update({[valueKey]: currentValue - 1});

                } else {
                    // burn the usage
                    await macroItem.update({'system.uses.spent': macroItem.system.uses.spent + 1});

                }

                await MidiQOL.setBonusActionUsed(actor);
                await applySearing(targetToken, actor.system.attributes.spelldc, spellLevel);

                let diceCount = 1 + (spellLevel - 1);
                let diceMult = workflow.isCritical ? 2 : 1;
                diceCount = diceMult * diceCount;

                return new game.system.dice.DamageRoll(`${diceCount}d6`, {}, {
                    isCritical: workflow.isCritical,
                    properties: ["mgc"],
                    type: "fire",
                    flavor: optionName
                });
            }
        }

        return {};
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applySearing(targetToken, dc, spellLevel) {
    let effectData = {
        name: effectName,
        icon: "icons/magic/fire/dagger-rune-enchant-flame-strong-red.webp",
        origin: actor.uuid,
        changes: [
            {
                key:"flags.midi-qol.OverTime",
                value: `turn=start, saveAbility=con, saveDC=${dc}, damageRoll=${spellLevel}d6, damageType=fire, damageBeforeSave=true, label=${effectName}`,
                mode: 0,
                priority: 20
            }],
        duration: {seconds: 60}};

    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetToken.actor.uuid, effects: [effectData] });
    await ChatMessage.create({content: `${targetToken.name} is set on fire and begins to burn!`});
}
