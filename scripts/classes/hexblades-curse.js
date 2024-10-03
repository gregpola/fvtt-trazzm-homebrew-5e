/*
    Starting at 1st level, you gain the ability to place a baleful curse on someone. As a bonus action, choose one
    creature you can see within 30 feet of you. The target is cursed for 1 minute. The curse ends early if the target
    dies, you die, or you are Incapacitated. Until the curse ends, you gain the following benefits:

    - You gain a bonus to damage rolls against the cursed target. The bonus equals your proficiency bonus.
    - Any attack roll you make against the cursed target is a critical hit on a roll of 19 or 20 on the d20.
    - If the cursed target dies, you regain hit points equal to your warlock level + your Charisma modifier (minimum of 1 hit point).

    You can’t use this feature again until you finish a short or long rest.
 */
const version = "11.0";
const optionName = "Hexblades Curse";
const markedName = "Hexblades Curse Marked";

try {
    if (args[0] === "off") { //cleaning when deleting from caster
        let cursedTarget = findCursedTarget(item.uuid);
        if (cursedTarget) {
            const cursedEffect = cursedTarget.effects.find(entry => entry.name === markedName && entry.origin === item.uuid);
            if (cursedEffect) {
                await MidiQOL.socket().executeAsGM("removeEffects", {
                    actorUuid: cursedTarget.uuid,
                    effects: [cursedEffect.id]
                });
            }
        }

    } else if (args[0].tag === "DamageBonus") { //caster hitting for extra damage
        let targetActor = workflow.hitTargets?.first()?.actor;
        if (targetActor?.flags?.dae?.onUpdateTarget) {
            const isMarked = targetActor.flags.dae.onUpdateTarget.find(flag => flag.flagName === optionName && flag.sourceActorUuid === actor.uuid);
            if (isMarked) {
                let damageType = workflow.item.system.damage.parts[0][1];
                return {damageRoll: `@prof[${damageType}]`, flavor: "Hexblades Curse damage"};
            }
        }

        return {};

    } else if (args[0].macroPass === "preAttackRoll") { //caster Attacking
        if (workflow.targets.size > 0) {
            let targetActor = workflow.targets.first().actor;

            if (targetActor?.flags?.dae?.onUpdateTarget) {
                const isMarked = targetActor.flags.dae.onUpdateTarget.find(flag => flag.flagName === optionName && flag.sourceActorUuid === actor.uuid);
                if (isMarked) {
                    const effectData = {
                        "changes": [
                            {
                                "key": "flags.dnd5e.weaponCriticalThreshold",
                                "mode": CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                                "value": "19",
                                "priority": "20"
                            },
                            {
                                "key": "flags.dnd5e.spellCriticalThreshold",
                                "mode": CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                                "value": "19",
                                "priority": "20"
                            }
                        ],
                        "duration": {
                            "startTime": game.time.worldTime,
                        },
                        "icon": "icons/skills/melee/strike-dagger-white-orange.webp",
                        "label": "Critical Threshold change",
                        "flags": {
                            "core": {"statusId": "HexBlade Curse - Critical Threshold"},
                            "dae": {"specialDuration": ["1Attack"]}
                        }
                    };
                    await MidiQOL.socket().executeAsGM("createEffects", {
                        actorUuid: actor.uuid,
                        effects: [effectData]
                    });
                }
            }
        }
        else {
            console.error(`${optionName} - no targets in preAttackRoll`);
        }

    } else if (lastArgValue && lastArgValue.tag === "onUpdateTarget") { // hp.value was updated on the actor
        const updatedHitPoints = lastArgValue.updates?.system?.attributes?.hp?.value ?? 1;
        if (updatedHitPoints < 1) {
            let sourceActor = fromUuidSync(lastArgValue.origin?.split(".Item")[0]);
            if (sourceActor) {
                sourceToken = sourceActor?.token ?? sourceActor?.getActiveTokens()[0];
                const healing = Math.max(1, (sourceActor.getRollData().classes?.warlock?.levels ?? 0) + sourceActor.getRollData().abilities.cha.mod);
                await MidiQOL.applyTokenDamage([{
                    damage: healing,
                    type: 'healing'
                }], healing, new Set([sourceToken]), null, null, {forceApply: false});
                const sourceEffect = sourceActor.effects.find(eff => eff.name === optionName);
                if (sourceEffect) await MidiQOL.socket().executeAsGM("removeEffects", {
                    actorUuid: sourceActor.uuid,
                    effects: [sourceEffect.id]
                });
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

function findCursedTarget(itemUuid) {
    // get all tokens on the canvas
    let tokens = canvas.tokens.placeables;

    // find the first token with the "Warder" active effect
    let cursedToken = tokens.find(token => {
        // check if the token has an actor
        if (token.actor) {
            return token.actor.effects.find(entry => entry.name === markedName && entry.origin === itemUuid);
        }
        return false;
    });

    // return the actor
    return cursedToken ? cursedToken.actor : null;
}