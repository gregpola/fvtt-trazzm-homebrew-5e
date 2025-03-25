/*
	 Melee Weapon Attack: +7 to hit, reach 5 ft., one creature. Hit: 15 (2d10 + 4) necrotic damage, and the target's
	 Strength score is reduced by 1d4. The target dies if this reduces its Strength to 0. Otherwise, the reduction lasts
	 until the target finishes a short or long rest. If a non-evil humanoid dies from this attack, a new shadow rises
	 from the corpse 1d4 hours later.
*/
const version = "10.0";
const optionName = "Shadow Spider Bite";
const mutationName = "shadow-spider-bite";
const originalStrengthFlag = "original-strength";

try {
    const wf = scope.workflow;

    if (args[0].macroPass === "postActiveEffects") {
        const lastArg = args[args.length - 1];
        const targetToken = wf.hitTargets.size > 0 ? wf.hitTargets.first() : undefined;

        if (targetToken) {
            let roll = await new Roll(`1d4`).evaluate({ async: true });
            await game.dice3d?.showForRoll(roll);

            // Apply strength reduction
            let currentStrength = targetToken.actor.system.abilities.str.value;
            const newStrength = Math.max(0, currentStrength - roll.total);

            // save away the original strength
            let existingFlag = targetToken.actor.getFlag('world', originalStrengthFlag);
            if (!existingFlag) {
                await targetToken.actor.setFlag('world', originalStrengthFlag, currentStrength);
            }

            // reduce the strength and check for death
            await targetToken.actor.update({"system.abilities.str.value": newStrength });

            ChatMessage.create({
                content: `${targetToken.actor.name}'s strength drains away`,
                speaker: ChatMessage.getSpeaker({ actor: targetToken.actor })});

            // check for death
            if (newStrength === 0) {
                await applyDeathEffect(wf.uuid, targetToken.actor);
            }
        }
    }
    else if (args[0] === "off") {
        const oldStrength = actor.getFlag('world', originalStrengthFlag);
        if (oldStrength) {
            await actor.update({"system.abilities.str.value": oldStrength });
            await ChatMessage.create({content: `${actor.name} strength returns to normal`});
            await actor.unsetFlag('world', originalStrengthFlag);
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