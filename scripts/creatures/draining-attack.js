/*
	 The target’s hit point maximum is reduced by an amount equal to the necrotic damage taken, and the vampire regains
	 hit points equal to that amount. The reduction lasts until the target finishes a long rest. The target dies if its
	 hit point maximum is reduced to 0.
*/
const version = "11.0";
const optionName = "Draining Attack";

try {
	if (args[0] === "on") {
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
				if (newMax < 1) {
					await targetTokenDoc.actor.update({"system.attributes.hp.value": 0});
					await applyDeathEffect(lastArg.sourceItemUuid, targetTokenDoc.actor);
				}
			}
		}
	}
	else if (args[0] === "off") {

	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyDeathEffect(originId, target) {

    let effectData = [{
        name: optionName,
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
