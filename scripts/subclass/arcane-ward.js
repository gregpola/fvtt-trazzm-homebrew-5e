/*
    You can weave magic around yourself for protection. When you cast an Abjuration spell with a spell slot, you can
    simultaneously use a strand of the spell’s magic to create a magical ward on yourself that lasts until you finish a
    Long Rest. The ward has a Hit Point maximum equal to twice your Wizard level plus your Intelligence modifier.
    Whenever you take damage, the ward takes the damage instead, and if you have any Resistances or Vulnerabilities,
    apply them before reducing the ward’s Hit Points. If the damage reduces the ward to 0 Hit Points, you take any
    remaining damage. While the ward has 0 Hit Points, it can’t absorb damage, but its magic remains.

    Whenever you cast an Abjuration spell with a spell slot, the ward regains a number of Hit Points equal to twice the
    level of the spell slot. Alternatively, as a Bonus Action, you can expend a spell slot, and the ward regains a
    number of Hit Points equal to twice the level of the spell slot expended.

    Once you create the ward, you can’t create it again until you finish a Long Rest.
*/
const optionName = "Arcane Ward";
const version = "13.5.0";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _flagName = "arcane-ward-hp";

try {
    let wardFlag = actor.getFlag(_flagGroup, _flagName);

	if (args[0].macroPass === "isHit") {
        if (wardFlag.current > 0) {
            await applyDamageAbsorption(actor, wardFlag.current);
            Hooks.once("midi-qol.RollComplete", async (workflow) => {
                let absorbedDamage = 0;
                const reductions = workflow.damageItem.damageDetail.filter(i => i.type === "none" && i.value < 0);
                if (reductions && reductions.length > 0) {
                    for (let r of reductions) {
                        absorbedDamage -= r.value;
                    }
                }

                if (absorbedDamage > 0) {
                    const newWardStrength = Math.max(0, wardFlag.current - absorbedDamage);
                    await actor.setFlag(_flagGroup, _flagName, {max: wardFlag.max, current: newWardStrength});

                    ChatMessage.create({
                        content: `${token.name}'s Arcane Ward absorbs ${absorbedDamage} damage and hit points is reduced to ${newWardStrength} of ${wardFlag.max}`,
                        speaker: ChatMessage.getSpeaker({actor: actor})
                    });
                }
            });
        }

    }
    else if (args[0].tag === "OnUse"
        && args[0].macroPass === "postActiveEffects"
        && workflow.item.type === "spell"
        && workflow.item.system.school === "abj") {

        const spellLevel = workflow.castData.castLevel;
        const maxHeal = spellLevel * 2;
        const wardHeal = wardFlag.current + maxHeal > wardFlag.max ? wardFlag.max - wardFlag.current : maxHeal;
        const newWardStrength = wardFlag.current + wardHeal;
        await actor.setFlag(_flagGroup, _flagName, { max: wardFlag.max, current: newWardStrength });

        ChatMessage.create({
            content: `${token.name}'s Arcane Ward gains ${wardHeal} hit points to ${newWardStrength} of ${wardFlag.max}`,
            speaker: ChatMessage.getSpeaker({actor: actor})
        });
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
