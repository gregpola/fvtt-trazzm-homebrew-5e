/*
    When a creature that you can see within 30 feet of yourself takes damage, you can take a Reaction to cause your
    Arcane Ward to absorb that damage. If this damage reduces the ward to 0 Hit Points, the warded creature takes any
    remaining damage. If that creature has any Resistances or Vulnerabilities, apply them before reducing the ward’s
    Hit Points.
*/
const optionName = "Projected Ward";
const version = "13.5.0";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _flagName = "arcane-ward-hp";

try {
    const sourceActor = macroItem.parent;
    const wardFlag = sourceActor.getFlag(_flagGroup, _flagName);

    if (args[0].tag === "TargetOnUse" && args[0].macroPass === "isAttacked") {
        if (wardFlag) {
            await applyDamageAbsorption(actor, wardFlag.current);
        }
    }
    else if (args[0].tag === "TargetOnUse" && args[0].macroPass === "preTargetDamageApplication") {
        if (wardFlag) {
            let absorbedDamage = 0;
            const reductions = workflow.damageItem.damageDetail.filter(i => i.type === "none" && i.value < 0);
            if (reductions && reductions.length > 0) {
                for (let r of reductions) {
                    absorbedDamage -= r.value;
                }
            }

            if (absorbedDamage > 0) {
                const newWardStrength = Math.max(0, wardFlag.current - absorbedDamage);
                await sourceActor.setFlag(_flagGroup, _flagName, {max: wardFlag.max, current: newWardStrength});

                ChatMessage.create({
                    content: `${sourceActor.name}'s Arcane Ward absorbs ${absorbedDamage} damage and hit points is reduced to ${newWardStrength} of ${wardFlag.max}`,
                    speaker: ChatMessage.getSpeaker({actor: actor})
                });
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyDamageAbsorption(actor, amount) {
    let effectData = {
        name: optionName,
        icon: item.img,
        origin: item.uuid,
        changes: [
            {
                key: 'system.traits.dm.midi.all',
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -amount,
                priority: 20
            }
        ],
        duration: {
        },
        flags: {
            dae: {
                specialDuration: ['isHit']
            }
        }
    };

    await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: actor.uuid, effects: [effectData]});
}
