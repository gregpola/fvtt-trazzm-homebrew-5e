/*
    When you cast this spell, you gain one level of contamination.

    An arcing bolt of octarine lightning strikes a creature within range. If the target has one or more contamination
    levels, it is hit automatically. Otherwise, make a ranged spell attack against that creature. On a hit, the target
    takes 6d6 necrotic damage and gains one level of contamination.

    You can create a new bolt of lightning as your action on any turn until the spell ends.
*/
const optionName = "Warp Bolt";
const version = "13.5.0";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _flagName = "warp-bolt-attack-bonus";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "preAttackRoll") {
        const targetToken = workflow.targets.first();
        if (targetToken) {
            let currentContamination = targetToken.actor.flags.drakkenheim?.contamination ?? 0;
            if (currentContamination > 0) {
                await applyAttackBonus(actor);
            }
        }
    }
    else if (args[0].macroPass === "postActiveEffects") {
        for (let targetToken of workflow.hitTargets) {
            let currentContamination = targetToken.actor.flags.drakkenheim?.contamination ?? 0;
            await targetToken.actor.update({['flags.drakkenheim.contamination']: currentContamination+1});
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyAttackBonus(actor) {
    let effectData = {
        name: `${optionName} - auto hit`,
        icon: macroItem.img,
        origin: macroItem.uuid,
        type: "base",
        transfer: false,
        statuses: [],
        changes: [
            {
                'key': 'flags.automated-conditions-5e.attack.bonus',
                'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                'value': 'bonus=99; once;',
                'priority': 20
            }
        ],
        flags: {
            dae: {
                stackable: 'noneName',
                specialDuration: ['turnStartSource', 'DamageDealt', 'combatEnd']
            }
        }
    };

    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effectData] });
}
