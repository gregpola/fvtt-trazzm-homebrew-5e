/*
	As a bonus action on your turn, you can expend one spell slot and gain a number of sorcery points equal to the slot’s level.
*/
const version = "12.3.0";
const optionName = "Font of Magic - Convert";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const fontOfMagic = actor.items.find(i => i.name === 'Font of Magic');
        if (fontOfMagic) {
            let usesLeft = fontOfMagic.system.uses.value;
            const pointsMax = fontOfMagic.system.uses.max ?? 0;
            if (pointsMax < 1) {
                return ui.notifications.error(`${optionName} - no sorcery points`);
            }

            const spells = duplicate(actor.system.spells);
            if (!spells) {
                return ui.notifications.error(`${optionName} - no spells found`);
            }

            const has_available_spell_slots = Object.values(spells).filter(({value, max}) => {
                return (value > 0 && max > 0);
            }).length > 0;
            if (!has_available_spell_slots) {
                return ui.notifications.error(`${optionName} - no spell slots available for conversion`);
            }

            // build the dialog content
            let rows = "";
            for (let [key, {level, value, max}] of Object.entries(spells)){
                if (key.startsWith('spell') && value > 0) {
                    let row = `<label style="margin-bottom: 10px;"><input style="right: 10px;" type="radio" name="choice" value="${level}" />${CONFIG.DND5E.spellLevels[level]}</label>`;
                    rows += row;
                }
            }

            let content = `
              <form>
                <div class="flexcol">
                    <div class="flexrow" style="margin-bottom: 5px;"><label>Select the spell slot to convert: </label></div>
                    <div class="flexrow" style="margin-bottom: 10px;"><sub>(gain 1 sorcery point per spell level)</sub></div>
                    <div id="slotRows" class="flexcol" style="margin-bottom: 10px;">
                        ${rows}
                    </div>
                </div>
              </form>`;

            await foundry.applications.api.DialogV2.prompt({
                content: content,
                rejectClose: false,
                ok: {
                    callback: async(event, button, dialog) => {
                        var slotToConvert = button.form.elements.choice.value;
                        if (slotToConvert) {
                            await actor.update({[`system.spells.spell${slotToConvert}.value`]:
                                foundry.utils.getProperty(actor, `system.spells.spell${slotToConvert}.value`) - 1});
                            const newValue = Math.clamped(usesLeft + Number(slotToConvert), 0, pointsMax);
                            await fontOfMagic.update({"system.uses.value": newValue});
                            ChatMessage.create({'content': `${actor.name} : regained ${slotToConvert} sorcery points!`});
                        }
                    }
                },
                window: {
                    title: `${optionName}`,
                },
                position: {
                    width: 500
                }
            });
        }
        else {
            ui.notifications.error(`${optionName} - missing Font of Magic`);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
