const version = "12.3.0";
const optionName = "Web Attack";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const spelldc = 12;

try {
    if (args[0].macroPass === "postActiveEffects") {
        // add restrained to the targets that failed their save
        let stuckEffectData = {
            name: 'Stuck In Webs',
            icon: 'icons/creatures/webs/web-spider-caught-hand-purple.webp',
            changes: [
                {
                    'key': 'macro.CE',
                    'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    'value': 'Restrained',
                    'priority': 20
                },
                {
                    'key': 'macro.createItem',
                    'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    'value': 'Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-items.Item.3GBSZ2RemODj1eBL',
                    'priority': 21
                },
                {
                    'key': 'macro.tokenMagic',
                    'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    'value': 'simpleweb',
                    'priority': 22
                }
            ],
            flags: {
                'fvtt-trazzm-homebrew-5e': {
                    'spelldc': spelldc
                }
            },
            origin: origin,
            disabled: false
        };

        for (let target of workflow.hitTargets) {
            let stuckEffect = HomebrewHelpers.findEffect(target.actor, 'Stuck In Webs');
            if (!stuckEffect) {
                await MidiQOL.socket().executeAsGM("createEffects", {
                    actorUuid: target.actor.uuid,
                    effects: [stuckEffectData]
                });
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
