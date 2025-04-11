/*
    You study your opponents and learn from each attack you make. If you make an attack roll against a creature and
    miss, you have Advantage on your next attack roll against that creature before the end of your next turn.
 */
const version = "12.4.0";
const optionName = "Studied Attacks";
const effectName = `${optionName} - Advantage`;

try {
    if (game.combat && ["mwak", "rwak", "msak", "rsak"].includes(rolledItem.system.actionType)) {
        if (args[0].tag === "OnUse" && args[0].macroPass === "postAttackRoll") {
            let activeEffects = actor.getRollData().effects.filter(i => i.name === effectName);
            const effect = HomebrewHelpers.findEffect(actor, effectName);
            const targetToken = workflow.hitTargets.first();
            let extraDamageTargets = workflow.hitTargets.filter(target => flag.targets.includes(target.document.uuid));

            if (targetToken) {

            }
        }
        else if (args[0].tag === "OnUse" && args[0].macroPass === "preAttackRoll") {
            const targetToken = workflow.targets.first();
            let flag = actor.getFlag(_flagGroup, _flagName);
            const isExpired = checkExpired(flag);

            if (flag) {
                if (!isExpired && targetToken && flag.targetId === targetToken.id) {
                    workflow.advantage = true;
                }

                if (isExpired) {
                    await actor.unsetFlag(_flagGroup, _flagName);
                }
            }
        }
    }
    else {
        console.debug(`${optionName} - not in combat -OR- an attack roll`);
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function markAdvantage(actorId, targetId) {
    const effectData = {
        name: `${effectName}`,
        icon: "icons/skills/targeting/crosshair-ringed-gray.webp",
        origin: macroItem.uuid,
        type: "base",
        changes: [
            {
                key: 'flags.midi-qol.advantage.attack.all',
                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value: 'targetId === "' + targetId + '"',
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
                    "turnEndSource"
                ]
            },
            trazzm: {
                targetId: targetId
            }
        }
    };

    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actorId, effects: [effectData] });
}

function checkExpired(flag) {
    if (flag) {
        const roundDiff = game.combat.round - flag.round;
        const turnDiff = game.combat.turn - flag.turn;

        if (roundDiff > 1) {
            return true;
        }
        else if ((roundDiff === 1) && (turnDiff > 0)) {
            return true;
        }
    }

    return false;
}
