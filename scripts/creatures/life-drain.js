/*
	 The target must succeed on a Constitution saving throw or its hit point maximum is reduced by an amount equal
	 to the damage taken. This reduction lasts until the creature finishes a long rest. The target dies if this effect
	 reduces its hit point maximum to 0.
*/
const version = "11.0";
const optionName = "Life Drain";
const hpMaxFlag = "original-max-hp";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let target = workflow.failedSaves.first();
        if (target) {
            const nectroticDamage = workflow.damageDetail.find(i => i.type === "necrotic");

            if (nectroticDamage.damage > 0) {
                // apply hp max reduction
                let currentMax = target.actor.system.attributes.hp.max;
                const newMax = Math.max(0, currentMax - nectroticDamage.damage);

                // save away the original max hp
                let existingFlag = target.actor.getFlag('fvtt-trazzm-homebrew-5e', hpMaxFlag);
                if (!existingFlag) {
                    await target.actor.setFlag('fvtt-trazzm-homebrew-5e', hpMaxFlag, currentMax);
                }

                // reduce the hp max and check for death
                await target.actor.update({"system.attributes.hp.max": newMax });
                ChatMessage.create({
                    content: `${target.name} is drained ${nectroticDamage.damage} Max HP`,
                    speaker: ChatMessage.getSpeaker({ actor: actor })});

                // check for death
                if (newMax === 0) {
                    await target.actor.update({"system.attributes.hp.value": 0});
                    await applyDeathEffect(workflow.origin, target.actor);
                }
            }

        }
    }
    else if (args[0] === "off") {
        const oldHpMax = actor.getFlag('fvtt-trazzm-homebrew-5e', hpMaxFlag);
        if (oldHpMax) {
            await actor.unsetFlag('fvtt-trazzm-homebrew-5e', hpMaxFlag);
            await actor.update({"system.attributes.hp.max": oldHpMax });
            await ChatMessage.create({content: `${actor.name} Max HP returns to normal`});
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyDeathEffect(originId, target) {

    let effectData = [{
        label: optionName,
        icon: 'icons/magic/death/grave-tombstone-glow-teal.webp',
        origin: originId,
        transfer: false,
        disabled: false,
        changes: [
            { key: `macro.CE`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: "Dead", priority: 20 }
        ]
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.uuid, effects: effectData });
}
