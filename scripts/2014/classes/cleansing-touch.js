/*
    Beginning at 14th level, you can use your action to end one spell on yourself or on one willing creature that you touch.
    You can use this feature a number of times equal to your Charisma modifier (a minimum of once). You regain expended
    uses when you finish a long rest.
*/
const version = "12.3.0";
const optionName = "Cleansing Touch";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const targetToken = workflow.targets.first();

        // get all spell effects on  the target
        let effects = targetToken.actor.getRollData().effects.filter(e => e.origin);
        if (effects && effects.length > 0) {
            let concentrationEffects = new Map();
            let otherEffects = [];

            // gather effect data
            // first go through and eliminate effects that are covered by a Concentration effect,
            // since they will be covered by the dispel of the concentration effect
            for (let effect of effects) {
                const effectSource = await fromUuid(effect.origin);
                if (effectSource && effectSource.type === "spell") {
                    let level = effectSource.system.level;

                    if (effect.name === "Concentrating") {
                        concentrationEffects.set(effect.origin, {effectId: effect.id, level: level, name: effectSource.name});
                    }
                    else {
                        otherEffects.push({origin: effect.origin, effectId: effect.id, level: level, name: effect.name});
                    }
                }
            }

            // build an array of spell effects to choose between
            let effectsToDispel = [];

            // first add in all concentration effects, because we know we have to process them
            for (let concentrationData of concentrationEffects.values()) {
                effectsToDispel.push(concentrationData);
            }

            // eliminate effects that are covered by a Concentration effect,
            // since they will be covered by the concentration effect
            for (let otherData of otherEffects) {
                if (!concentrationEffects.has(otherData.origin)) {
                    effectsToDispel.push({effectId: otherData.effectId, level: otherData.level, name: otherData.name});
                }
            }

            // build the select content
            let spellRows = "";
            for (let spellData of effectsToDispel) {
                let row = `<option value="${spellData.effectId}">${spellData.name}</option>`;
                spellRows += row;
            }

            // build the dialog content
            let content = `
              <form>
                <div class="flexcol">
                    <div class="flexrow" style="margin-bottom: 10px;"><label>Select the spell to dispel:</label></div>
                    <div class="flexrow" style="margin-bottom: 10px;">
                        <select id="selectedSpell">${spellRows}</select>
                    </div>
                </div>
              </form>`;

            // ask the Paladin which spell to dispel
            let spellEffectId = await foundry.applications.api.DialogV2.prompt({
                content: content,
                rejectClose: false,
                ok: {
                    callback: (event, button, dialog) => {
                        return button.form.elements.selectedSpell.value;
                    }
                },
                window: {
                    title: `${optionName}`,
                },
                position: {
                    width: 500
                }
            });

            if (spellEffectId) {
                await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: targetToken.actor.uuid, effects: [spellEffectId] });
                await HomebrewMacros.wait(200);
                ChatMessage.create({
                    content: `${token.name} dispels ${effectData.name} from ${targetToken.name}`,
                    speaker: ChatMessage.getSpeaker({ actor: actor })});
            }
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
