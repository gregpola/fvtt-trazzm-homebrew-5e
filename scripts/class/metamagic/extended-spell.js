/*
    When you cast a spell that has a duration of 1 minute or longer, you can spend 1 Sorcery Point to double its
    duration to a maximum duration of 24 hours.

    If the affected spell requires Concentration, you have Advantage on any saving throw you make to maintain that Concentration.
*/
const optionName = "Extended Spell";
const version = "12.4.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        Hooks.once("dnd5e.postActivityConsumption", async(activity, usageConfig, messageConfig) => {
            const spell = activity.item;
            const isConcentration = usageConfig.concentration.begin;

            if (spell && spell.type === 'spell' && isConcentration) {
                const enchantmentEffect = spell.effects.find(e => e.name === 'Extended Spell' && e.type === 'enchantment');
                if (enchantmentEffect) {
                    Hooks.once("dnd5e.beginConcentrating", async(actor, spell, effect, activity) => {
                        const concAdvEffect = await applyAdvantageEffect(actor, spell);
                        await MidiQOL.addConcentrationDependent(actor, concAdvEffect[0], spell);
                    });
                }
            }
        });
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyAdvantageEffect(actor, item) {
    let effectData = {
        name: 'Extended Spell - Concentration Advantage',
        icon: 'icons/magic/time/hourglass-brown-orange.webp',
        changes: [
            {
                key: 'flags.automated-conditions-5e.concentration.advantage',
                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value: true,
                priority: 20
            }
        ],
        flags: {
            dae: {
                specialDuration: ['longRest']
            }
        },
        origin: item.uuid,
        duration: {
            seconds: null
        },
        disabled: false
    };

    return await MidiQOL.socket().executeAsGM("createEffects",
        {actorUuid: actor.uuid, effects: [effectData]});
}
