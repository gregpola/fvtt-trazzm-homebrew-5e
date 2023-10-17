const version = "10.0.0";
const resourceName = "Ki Points";
const optionName = "Deflect Missiles";
const optionCost = 1;

try {
	const lastArg = args[args.length - 1];
	let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	
	if (args[0].macroPass === "preItemRoll") {
		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			ui.notifications.error(`${optionName}: ${resourceName}: - no resource found`);
			return false;
		}

		// check available points
		const points = actor.system.resources[resKey].value;
		if (!points) {
			ui.notifications.error(`${optionName}: ${resourceName}: - out of resources`);
			return false;
		}
				
		if (points < optionCost) {
			ui.notifications.error(`${optionName}: ${resourceName} - not enough points (need ${optionCost})`);
			return false;
		}
	}
	else if (args[0].macroPass === "postActiveEffects") {
		// double check the resource
		let resKey = findResource(actor);
		if (!resKey) {
			ui.notifications.error(`${optionName}: ${resourceName}: - no resource found`);
			return false;
		}

		// check the attack type
		const sourceItem = await fromUuid(lastArg.workflowOptions.sourceItemUuid);
		if (sourceItem?.system.actionType !== "rwak") {
			return ui.notifications.warn(`${actor.name} - ${optionName} | not a ranged weapon attack`);
		}
		
		// Find the DR amount
		const effect =  lastArg.actorData.effects.find(ef=>ef.label === "Deflect Missiles Damage Reduction");
		const change = effect.changes.find(change => change.key === "flags.midi-qol.DR.rwak");
		const damageReduction = (await new Roll(change.value, actor.getRollData()).evaluate({async: true})).total;
		const incomingDamage = lastArg.workflowOptions.damageTotal;
		
		// compare to the incoming damage
		if (damageReduction >= incomingDamage) {
			// shouldn't need to check Ki points since that is done in the preItemRoll phase
			const throwBack = await Dialog.confirm({
					title: game.i18n.localize("Return Missile"),
					content: `<p>Throw the missile back at the attacker?</p>`,
				});
			if (!throwBack) return;
			
			// get the returned item
			// use the ammo if there is one otherwise the weapon
			let theItem = await fromUuid(lastArg.workflowOptions.sourceAmmoUuid ?? lastArg.workflowOptions.sourceItemUuid);
			const theItemData = theItem.toObject();
			theItemData.system.range.value = 20;
			theItemData.system.range.long = 40;
			theItemData.actionType = "rwak";
			theItemData.system.consume = lastArg.itemData.system.consume;
			
			let ownedItem = new CONFIG.Item.documentClass(theItemData, { parent: actor });
			const targetTokenOrActor = await fromUuid(lastArg.workflowOptions.sourceActorUuid);
			const targetActor = targetTokenOrActor.actor ?? targetTokenOrActor;
			const target = targetActor.token ?? targetActor.getActiveTokens()?.shift();

			await MidiQOL.completeItemRoll(ownedItem, {targetUuids: [target.uuid ?? target.document.uuid], workflowOptions: {notReaction: true, autoConsumeResource: "both"}});
			await consumeResource(actor, resKey, optionCost);
		}		
	}

} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}

// find the resource matching this feature
function findResource(actor) {
	if (actor) {
		for (let res in actor.system.resources) {
			if (actor.system.resources[res].label === resourceName) {
			  return res;
			}
		}
	}
	
	return null;
}

// handle resource consumption
async function consumeResource(actor, resKey, cost) {
	if (actor && resKey && cost) {
		const {value, max} = actor.system.resources[resKey];
		if (!value) {
			ChatMessage.create({'content': '${resourceName} : Out of resources'});
			return false;
		}
		
		const resources = foundry.utils.duplicate(actor.system.resources);
		const resourcePath = `system.resources.${resKey}`;
		resources[resKey].value = Math.clamped(value - cost, 0, max);
		await actor.update({ "system.resources": resources });
		return true;
	}
}
