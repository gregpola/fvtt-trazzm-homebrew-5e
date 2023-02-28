/*
	 The target's Strength score is reduced by 1d4 on a hit. The target dies if this reduces its Strength to 0. Otherwise, the reduction lasts until the target finishes a short or long rest. If a non-evil humanoid dies from this attack, a new shadow rises from the corpse 1d4 hours later.
*/
const version = "10.0.0";
const optionName = "Strength Drain";

try {
	if (args[0].macroPass === "postActiveEffects") {
		const lastArg = args[args.length - 1];
		const targetTokenDoc = lastArg.hitTargets.length > 0 ? lastArg.hitTargets[0] : undefined;
		
		if (targetTokenDoc) {
			let roll = await new Roll(`1d4`).evaluate({ async: true });
			await game.dice3d?.showForRoll(roll);
			
			// Apply strength reduction
			let currentStrength = targetTokenDoc.actor.system.abilities.str.value;
			const newStrength = Math.max(0, currentStrength - roll.total);
			
			const updates = {
				actor: {
					"system.abilities.str.value": newStrength
				}
			}
			
			/* Mutate the actor */
			await warpgate.mutate(targetTokenDoc, updates);
			ChatMessage.create({
				content: `${targetTokenDoc.actor.name}'s strength drains away`,
				speaker: ChatMessage.getSpeaker({ actor: targetTokenDoc.actor })});

			// check for death
			if (newStrength === 0) {
				await targetTokenDoc.actor.update({"system.attributes.hp.value": 0});
				await applyDeathEffect(lastArg.sourceItemUuid, targetTokenDoc.actor);
			}
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
