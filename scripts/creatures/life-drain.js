/*
	 The target must succeed on a DC 10 Constitution saving throw or its hit point maximum is reduced by an amount equal
	 to the damage taken. This reduction lasts until the creature finishes a long rest. The target dies if this effect
	 reduces its hit point maximum to 0.
*/
const version = "10.0";
const optionName = "Life Drain";
const hpMaxFlag = "original-max-hp";

try {
    const lastArg = args[args.length - 1];

    if (args[0] === "on") {
        let workflow = MidiQOL.Workflow.getWorkflow(lastArg.origin);

        if (actor) {
            const nectroticDamage = workflow.damageDetail.find(i => i.type === "necrotic");

            if (nectroticDamage.damage > 0) {
                // apply hp max reduction
                let currentMax = actor.system.attributes.hp.max;
                const newMax = Math.max(0, currentMax - nectroticDamage.damage);

                // save away the original max hp
                let existingFlag = actor.getFlag('world', hpMaxFlag);
                if (!existingFlag) {
                    actor.setFlag('world', hpMaxFlag, currentMax);
                }

                // reduce the hp max and check for death
                await actor.update({"system.attributes.hp.max": newMax });
                ChatMessage.create({
                    content: `${actor.name} is drained ${nectroticDamage.damage} Max HP`,
                    speaker: ChatMessage.getSpeaker({ actor: actor })});

                // check for death
                if (newMax === 0) {
                    await actor.update({"system.attributes.hp.value": 0});
                    await applyDeathEffect(lastArg.origin, actor);
                }
            }
        }
    }
    else if (args[0] === "off") {
        const oldHpMax = actor.getFlag('world', hpMaxFlag);
        if (oldHpMax) {
            await actor.update({"system.attributes.hp.max": oldHpMax });
            await ChatMessage.create({content: `${actor.name} Max HP returns to normal`});
            await actor.unsetFlag('world', hpMaxFlag);
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
