/*
    Macro is used to handle the various subclass features
*/
const version = "12.3.0";
const optionName = "Rage";
const giantsHavocEffectName = "Giant's Havoc - Enlarged";
const elementalCleaverEffectName = "Elemental Cleaver Infused";

try {
    if (args[0].macroPass === "postActiveEffects") {
        // check for Fanatical Focus and add a use if uses is 0
        let fanaticalFocus = actor.items.getName("Fanatical Focus");
        if (fanaticalFocus) {
            if (fanaticalFocus.system.uses.value < 1) {
                await fanaticalFocus.update({"system.uses.value": 1});
            }
        }

        // check for Giant's Havoc
        const hasGiantsHavoc = actor.items.getName("Giant's Havoc");
        if (hasGiantsHavoc) {
            let newSize = "lg";
            let newTokenScale = "2";
            let newReach = "+5";

            const hasDemiurgicColossus = actor.items.getName("Demiurgic Colossus");
            if (hasDemiurgicColossus) {
                // ask which size
                newReach = "+10";

                // ask what size they want to grow to
                const content = `<p>What size do you want to grow to?</p>
			        <label style="margin-bottom: 10px;"><input type="radio" name="choice" value="large" checked>  Large </label>
			        <label style="margin-bottom: 10px;"><input type="radio" name="choice" value="huge">  Huge </label>`;

                await foundry.applications.api.DialogV2.prompt({
                    content: content,
                    rejectClose: false,
                    ok: {
                        callback: (event, button, dialog) => {
                            if (button.form.elements.choice.value === "huge") {
                                newSize = "huge";
                                newTokenScale = 3;
                            }
                        }
                    },
                    window: {
                        title: "Demiurgic Colossus",
                    },
                    position: {
                        width: 400
                    }
                });
            }

            // increase size
            let effectData = {
                name: giantsHavocEffectName,
                icon: 'icons/magic/movement/abstract-ribbons-red-orange.webp',
                changes: [
                    {
                        key: 'system.traits.size',
                        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                        value: newSize,
                        priority: 22
                    },
                    {
                        key: 'ATL.width',
                        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                        value: newTokenScale,
                        priority: 23
                    },
                    {
                        key: 'ATL.height',
                        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                        value: newTokenScale,
                        priority: 24
                    },
                    {
                        key: 'flags.midi-qol.range.mwak',
                        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                        value: newReach,
                        priority: 25
                    }
                ],
                origin: hasGiantsHavoc.uuid,
                disabled: false
            };

            await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: actor.uuid, effects: [effectData]});
        }
    }
    else if (args[0] === "off") {
        const hasGiantsHavoc = actor.items.getName("Giant's Havoc");
        if (hasGiantsHavoc) {
            await HomebrewEffects.removeEffectByNameAndOrigin(actor, giantsHavocEffectName, hasGiantsHavoc.uuid);
        }

        const elementalCleaver = HomebrewHelpers.findEffect(actor, elementalCleaverEffectName);
        if (elementalCleaver) {
            await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [elementalCleaver.id] });
        }
    }

    // TODO add an each macro to end effect if they haven't attacked

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
