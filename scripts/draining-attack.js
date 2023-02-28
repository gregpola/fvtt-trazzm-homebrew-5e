/*
	 The target’s hit point maximum is reduced by an amount equal to the necrotic damage taken, and the vampire regains hit points equal to that amount. The reduction lasts until the target finishes a long rest. The target dies if its hit point maximum is reduced to 0.
*/
const version = "10.0.0";
const optionName = "Strength Drain";

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
				await warpgate.mutate(targetTokenDoc, updates, optionName);
				ChatMessage.create({
					content: `${targetTokenDoc.actor.name} is drained ${nectroticDamage.damage} max hp`,
					speaker: ChatMessage.getSpeaker({ actor: actor })});

				// check for death
				if (newMax === 0) {
					await targetTokenDoc.actor.update({"system.attributes.hp.value": 0});
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
