/*
    Starting at 1st level, you gain the ability to place a baleful curse on someone. As a bonus action, choose one
    creature you can see within 30 feet of you. The target is cursed for 1 minute. The curse ends early if the target
    dies, you die, or you are Incapacitated. Until the curse ends, you gain the following benefits:

    - You gain a bonus to damage rolls against the cursed target. The bonus equals your proficiency bonus.
    - Any attack roll you make against the cursed target is a critical hit on a roll of 19 or 20 on the d20.
    - If the cursed target dies, you regain hit points equal to your warlock level + your Charisma modifier (minimum of 1 hit point).
*/
const version = "12.4.0";
const optionName = "Hexblade's Curse";
const targetEffectName = "Hexblade's Cursed";

try {
    const originStart = `Actor.${actor.id}.`;

    if (args[0].macroPass === "DamageBonus") {
        if (!workflow.hitTargets.size) return {};

        for (let targetToken of workflow.hitTargets) {
            let isMarked = false;

            for (let targetEffect of targetToken.actor?.getRollData()?.effects) {
                if ((targetEffect.name === targetEffectName) && targetEffect.origin.startsWith(originStart)) {
                    isMarked = true;
                    break;
                }
            }

            if (isMarked) {
                const pb = actor.system.attributes.prof;
                return new CONFIG.Dice.DamageRoll(`${pb}[HexbladesCurse]`, {}, {type:workflow.defaultDamageType, properties: [...rolledItem.system.properties]});
            }
        }

        return {};

    } else if (args[0].tag === "OnUse" && args[0].macroPass === "preAttackRoll") {
        let targetToken = workflow.hitTargets.first();
        if (targetToken) {
            let targetEffect = targetToken.actor.getRollData().effects.find(e => e.name === targetEffectName && e.origin.startsWith(originStart));
            if (targetEffect) {
                await applyCritical(token);
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyCritical(token) {
    const effectData = {
        name: `${effectName} - critical`,
        icon: "icons/skills/targeting/crosshair-ringed-gray.webp",
        origin: macroItem.uuid,
        type: "base",
        changes: [
            {
                key: 'flags.dnd5e.weaponCriticalThreshold',
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: true,
                priority: 20
            },
            {
                key: 'flags.dnd5e.spellCriticalThreshold',
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: true,
                priority: 20
            }
        ],
        disabled: false,
        duration: {
        },
        transfer: false,
        flags: {
            dae: {
                stackable: "multi",
                specialDuration: [
                    "1Attack"
                ]
            }
        }
    };

    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actorId, effects: [effectData] });
}
