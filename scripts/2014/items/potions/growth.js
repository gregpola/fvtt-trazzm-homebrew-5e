/*
    When you drink this potion, you gain the "enlarge" effect of the enlarge/reduce spell for 1d4 hours (no
    concentration required). The red in the potion's liquid continuously expands from a tiny bead to color the clear
    liquid around it and then contracts. Shaking the bottle fails to interrupt this process.
*/
const version = "12.3.0";
const optionName = "Potion of Growth";
const potionEffectName = `${optionName} - enlarged`;

try {
    if (args[0].macroPass === "postActiveEffects") {
        const targetToken = workflow.targets.first();
        if (targetToken) {
            const tokenSize = targetToken.actor.system.traits.size;
            const internalSizes = Object.keys(CONFIG.DND5E.actorSizes);
            const tokenSizeNum = internalSizes.indexOf(tokenSize);

            if (tokenSizeNum < (internalSizes.length - 1)) {
                const newSize = internalSizes[tokenSizeNum + 1];

                let extraChanges = [
                    {
                        key: 'system.bonuses.mwak.damage',
                        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                        value: '+1d4',
                        priority: 1
                    },
                    {
                        key: 'system.bonuses.rwak.damage',
                        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                        value: '+1d4',
                        priority: 1
                    },
                    {
                        key: 'flags.midi-qol.advantage.ability.check.str',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: 1,
                        priority: 1
                    },
                    {
                        key: 'flags.midi-qol.advantage.ability.save.str',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: 1,
                        priority: 1
                    }
                ];

                await HomebrewEffects.resizeActor(targetToken.actor, newSize, potionEffectName, item.uuid, extraChanges);
            }
            else {
                ui.notifications.error(`${optionName}: ${resourceName}: - token already as large as can be`);
            }
        }
    }
    else if (args[0] === "off") {
        await HomebrewEffects.removeEffectByName(actor, potionEffectName);
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
