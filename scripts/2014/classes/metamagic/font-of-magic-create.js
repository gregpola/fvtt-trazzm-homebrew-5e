/*
	You can transform unexpended sorcery points into one spell slot as a bonus action on your turn. The Creating Spell
	Slots table shows the cost of creating a spell slot of a given level. You can create spell slots no higher in level
	than 5th.

	- Points to slots:
		2 points => 1st-level
		3 points => 2nd-level
		5 points => 3rd-level
		6 points => 4th-level
		7 points => 5th-level
*/
const version = "12.3.0";
const optionName = "Font of Magic - Create Slot";
const conversion_map = {"1": 2, "2": 3, "3": 5, "4": 6, "5": 7}

try {
    if (args[0].macroPass === "postActiveEffects") {
        const fontOfMagic = actor.items.find(i => i.name === 'Font of Magic');
        if (fontOfMagic) {
            let usesLeft = fontOfMagic.system.uses.value;
            if (usesLeft < 2) {
                return ui.notifications.error(`${optionName} - not enough sorcery points`);
            }

            const pointsMax = fontOfMagic.system.uses.max ?? 0;
            const spells = duplicate(actor.system.spells);
            if (!spells) {
                return ui.notifications.error(`${optionName} - no spells found`);
            }

            const is_missing_slots = Object.entries(spells).filter(([key, {value, max}]) => {
                let spell_level = Number(key.at(-1));
                if(spell_level > 5) return false;
                if(spell_level < 1) return false;
                return (max > 0 && value < max);
            });
            if (!is_missing_slots) {
                return ui.notifications.error(`${optionName} - no spell slots eligible to recover`);
            }

            // build the dialog content
            let rows = "";
            const maxLevel = determineMaximumSlot(usesLeft);
            for (let [key, {level, value, max}] of Object.entries(spells)){
                if (key.startsWith('spell') && level <= maxLevel && value < max) {
                    let levelCost = calculateLevelCost(level);
                    let row = `<label style="margin-bottom: 10px;"><input style="right: 10px;" type="radio" name="choice" value="${level}" />${CONFIG.DND5E.spellLevels[level]} (cost: ${levelCost})</label>`;
                    rows += row;
                }
            }

            let content = `
              <form>
                <div class="flexcol">
                    <div class="flexrow" style="margin-bottom: 10px;"><label>Select the spell slot to create: </label></div>
                    <div class="flexrow" style="margin-bottom: 10px;"><sub>(${usesLeft} / ${pointsMax} sorcery points)</sub></div>
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
                        var slotToRecover = button.form.elements.choice.value;
                        if (slotToRecover) {
                            await actor.update({[`system.spells.spell${slotToRecover}.value`]:
                                foundry.utils.getProperty(actor, `system.spells.spell${slotToRecover}.value`) + 1});
                            const newValue = Math.clamped(usesLeft - conversion_map[slotToRecover], 0, pointsMax);
                            await fontOfMagic.update({"system.uses.value": newValue});
                            ChatMessage.create({'content': `${actor.name} : regained a ${slotToRecover} level spell slot!`});
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

function determineMaximumSlot(usesLeft) {
    // makes assumption that error checking prevents less than 2 usesLeft
    switch (usesLeft) {
        case 2:
            return 1;
        case 3:
        case 4:
            return 2;
        case 5:
            return 3;
        case 6:
            return 4;
        default:
            return 5;
    }
}

function calculateLevelCost(level) {
    return conversion_map[level];
}
