/*
	As a bonus action, the cleric can expend a spell slot to cause its melee weapon attacks to magically deal an extra
	10 (3d6) radiant damage to a target on a hit. This benefit lasts until the end of the turn. If the cleric expends a
	spell slot of 2nd level or higher, the extra damage increases by 1d6 for each level above 1st.
*/
const version = "12.3.0";
const optionName = "Divine Eminence";

try {
    if (args[0].macroPass === "preItemRoll") {
        const spells = actor.system.spells;
        for(let [key, {value, max}] of Object.entries(spells)) {
            if (value > 0)
                return true;
        }

        return false;
    }
    else if (args[0].macroPass === "postActiveEffects") {
        // get spell slots available
        const rollData = foundry.utils.duplicate(actor.getRollData());
        const inputs = Object.entries(rollData.spells).filter(s => {
            return s[1].value > 0;
        }).map(([key, {value, max}]) => {
            let crd = key === "pact" ? "Pact Slot" : nth(Number(key.at(-1)));
            return [key, crd, value, max];
        });

        // ask which slot to use
        const options = inputs.reduce((acc, [key, crd, value, max]) => {
            return acc + `<option value="${key}">${crd} (${value}/${max})</option>`; }, ``);

        const myContent = `
		<form>
			<p>Which spell slot to use:</p>
			<div class="form-group">
				<label style="flex: 1;">Spell Slot:</label>
				<div class="form-fields">
					<select id="spellLevel">${options}</select>
				</div>
			</div>
		</form>`;

        const slot = await foundry.applications.api.DialogV2.confirm({
            window: {
                title: `${optionName}`,
            },
            content: myContent,
            yes: {
                callback: (event, button, dialog) => {
                    return button.form.elements.spellLevel.value;
                }
            },
            rejectClose: false,
            modal: true,
            position: {
                width: 400
            }
        });

        if (slot) {
            // deplete the slot
            const level = slot === "pact" ? rollData.spells["pact"].level : Number(slot.at(-1));
            const value = rollData.spells[slot].value - 1;
            await actor.update({[`system.spells.${slot}.value`]: value});

            // update the effect damage
            const numDice = 2 + level;
            const effectValue = `${numDice}d6[Radiant]`;

            let effectData = {
                name: 'Divine Eminence Bonus Damage',
                icon: 'icons/magic/light/orb-container-orange.webp',
                changes: [
                    {
                        key: 'system.bonuses.mwak.damage',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: effectValue,
                        priority: 20
                    }
                ],
                flags: {
                    dae: {
                        specialDuration: ['turnStartSource']
                    }
                },
                origin: macroItem.uuid,
                duration: {
                    seconds: null
                },
                disabled: false
            };

            return await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: actor.uuid, effects: [effectData]});
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

function nth(n){return n + (["st","nd","rd"][((n+90)%100-10)%10-1]||"th")}
