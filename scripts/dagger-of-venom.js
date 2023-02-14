const version = "10.0.0";
const optionName = "Dagger of Venom";
const flagName = "dagger-of-venom";
const damageDice = "2d10";
const saveDC = 15;

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);
	
	if (args[0].macroPass === "DamageBonus") {
		// poison only lasts one hit
		let flag = DAE.getFlag(actor, flagName);
		if (flag && lastArg.item._id === flag.itemId) {
			let apps = flag.applications;
			const itemName = flag.itemName;
			const itemId = flag.itemId;
			
			await warpgate.revert(actorToken.document, itemName);
			DAE.unsetFlag(actor, flagName);
			ChatMessage.create({content: itemName + " returns to normal"});
			
			// apply the poison damage
			let targetActor = (await fromUuid(lastArg.hitTargetUuids[0]))?.actor;			
			const uuid = targetActor.uuid;
			const saveFlavor = `${CONFIG.DND5E.abilities["con"]} DC${saveDC} ${optionName}`;
			let saveRoll = await targetActor.rollAbilitySave("con", {flavor: saveFlavor});
			await game.dice3d?.showForRoll(saveRoll);
			
			const damageRoll = await new Roll(`${damageDice}`).evaluate({ async: false });
			await game.dice3d?.showForRoll(damageRoll);

			if (saveRoll.total < saveDC) {
				await applyPoisonedEffect(actor, targetActor);
				return {damageRoll: `${damageRoll.total}[poison]`, flavor: `${optionName} Damage`};		
			}
			else {
				const dmg = Math.ceil(damageRoll.total/2);
				return {damageRoll: `${dmg}[poison]`, flavor: `${optionName} Damage`};		
			}
		}
	}
	
} catch (err) {
	console.error(`${optionName} - ${version}`, err);
}

async function applyPoisonedEffect(actor, target) {

    let effectData = [{
        label: optionName,
        icon: 'icons/consumables/potions/potion-jar-corked-labeled-poison-skull-green.webp',
        origin: actor.uuid,
        transfer: false,
        disabled: false,
		duration: {startTime: game.time.worldTime, seconds: 60},
        changes: [
            { key: `macro.CE`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: "Poisoned", priority: 20 }
        ]
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.uuid, effects: effectData });
}
