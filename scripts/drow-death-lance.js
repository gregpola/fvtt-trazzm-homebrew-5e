/*
	Melee Weapon Attack: +10 to hit, reach 5 ft., one target. Hit: 8 (1d6 + 5) piercing damage plus 18 (4d8) necrotic damage.
	The target’s hit point maximum is reduced by an amount equal to the necrotic damage taken. This reduction lasts until
	the target finishes a long rest. The target dies if its hit point maximum is reduced to 0.
*/
const version = "10.0.0";
const optionName = "Death Lance";

try {
	if (args[0].macroPass === "postActiveEffects") {
		const lastArg = args[args.length - 1];
		const targetTokenDoc = lastArg.hitTargets.length > 0 ? lastArg.hitTargets[0] : undefined;
		
		if (targetTokenDoc) {
			const nectroticDamage = lastArg.damageDetail.find(i => i.type === "necrotic");
			
			if (nectroticDamage.damage > 0) {		
				// apply hp max reduction
				let currentMax = targetTokenDoc.actor.system.attributes.hp.max;
				const newMax = Math.max(0, currentMax - nectroticDamage.damage);
				
				const updates = {
					actor: {
						"system.attributes.hp.max": newMax
					}
				}
				
				/* Mutate the actor */
				await warpgate.mutate(targetTokenDoc, updates);
				ChatMessage.create({
					content: `${targetTokenDoc.actor.name} is drained`,
					speaker: ChatMessage.getSpeaker({ actor: actor })});

				// check for death
				if (newMax === 0) {
					await applyDeathEffect(lastArg.sourceItemUuid, targetTokenDoc.actor);
				}
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
