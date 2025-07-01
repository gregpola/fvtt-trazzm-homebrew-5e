/*
    When you hit the target cursed by your Hexblade’s Curse with an attack roll, the target has Disadvantage on the next
    saving throw it makes before the start of your next turn.
 */
const optionName = "Hindering Curse";
const version = "12.4.0";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postAttackRoll") {
        const originStart = `Actor.${actor.id}.`;

        for (let targetToken of workflow.hitTargets) {
            if (HomebrewHelpers.isHexed(actor, targetToken.actor)) {
                await applyDisadvantage(targetToken);
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyDisadvantage(targetToken) {
    let effectData = {
        name: optionName,
        icon: macroItem.img,
        origin: macroItem.uuid,
        changes: [
            {
                key: 'flags.midi-qol.disadvantage.ability.save.all',
                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value: true,
                priority: 20
            }
        ],
        duration: {
        },
        flags: {
            dae: {
                specialDuration: ['isSave', 'turnStartSource']
            }
        }
    };

    await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: targetToken.actor.uuid, effects: [effectData]});
}
