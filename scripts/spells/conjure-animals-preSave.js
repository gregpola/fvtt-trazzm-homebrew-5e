/*
	You have Advantage on Strength saving throws while you’re within 5 feet of the pack
*/
const optionName = "Conjure Animals";
const version = "13.5.0";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "conjure-animals-flag";

try {
    if (args[0].tag === "TargetOnUse" && args[0].macroPass === "preTargetSave") {
        const flag = actor.getFlag(_flagGroup, flagName);
        if (flag) {
            const template = await fromUuid(flag.templateUuid);
            if (template) {
                const distance = canvas.grid.measurePath([template, token.document]).cost;
                if (distance <= 5) {
                    await applyAdvantageEffect(actor);
                    await HomebrewMacros.wait(1000);
                }
            }
        }
    }
} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}

async function applyAdvantageEffect(actor, origin) {
    let effectData = {
        name: 'Conjure Animals - Strength Advantage',
        icon: 'icons/magic/time/hourglass-brown-orange.webp',
        changes: [
            {
                key: 'flags.automated-conditions-5e.save.advantage',
                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value: 'ability.str; once;',
                priority: 20
            }
        ],
        flags: {
            dae: {
            }
        },
        origin: macroItem.uuid,
        duration: {
            seconds: null
        },
        disabled: false
    };

    return await MidiQOL.socket().executeAsGM("createEffects",
        {actorUuid: actor.uuid, effects: [effectData]});
}
