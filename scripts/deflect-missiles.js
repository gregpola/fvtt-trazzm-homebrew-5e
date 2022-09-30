const version = "0.1.0";
const resourceName = "Ki Points";
const optionName = "Deflect Missiles";

try {
	if (args[0].macroPass === "postActiveEffects") {
		let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
		let actor = workflow?.actor;
		
		const sourceItem = await fromUuid(workflow.workflowOptions.sourceItemUuid);
		if (sourceItem?.data.data.actionType!== "rwak") {
			return ui.notifications.warn(`${actor.name} - ${optionName} | Attack is not a ranged weapon attack`);
		}
		
		const effect =  args[0].actorData.effects.find(ef=>ef.data.label === "Deflect Missiles");
		const change = effect.data.changes.find(change => change.key === "flags.midi-qol.DR.rwak");
		const damageReduction = Number.isNumeric(change.value) ? Number(change.value) : 0;
		const incomingDamage = workflow.workflowOptions.damageTotal;
		
		// compare to the incoming damage
		if (damageReduction >= incomingDamage) {
			// check for ki points
			let resKey = findResource(actor);
			if (!resKey) {
				return ui.notifications.warn(`${actor.name} - ${optionName} | Ki resource not found`);
			}
			const points = actor.data.data.resources[resKey].value;
			if (!points) {
				return ui.notifications.warn(`${actor.name} - ${optionName} | Out of Ki`);
			}			
			
			const throwBack = await Dialog.confirm({
					title: game.i18n.localize("Return Missile"),
					content: `<p>Throw the missile back at the attacker</p>`,
				});
			if (!throwBack) return;
			
			// get the returned item
			let theItem = await fromUuid(args[0].workflowOptions.sourceAmmoUuid ?? args[0].workflowOptions.sourceItemUuid); // use the ammo if there is one otherwise the weapon
			const theItemData = duplicate(theItem.data);
			theItemData.data.range.value = 20;
			theItemData.data.range.long = 40;
			theItemData.actionType = "rwak";
			theItemData.data.consume = args[0].itemData.data.consume;
			
			let ownedItem = new CONFIG.Item.documentClass(theItemData, { parent: actor });
			const targetTokenOrActor = await fromUuid(args[0].workflowOptions.sourceActorUuid);
			const targetActor = targetTokenOrActor.actor ?? targetTokenOrActor;
			const target = targetActor.token ?? targetActor.getActiveTokens()?.shift();

			await MidiQOL.completeItemRoll(ownedItem, {targetUuids: [target.uuid ?? target.document.uuid], workflowOptions: {notReaction: true, autoConsumeResource: "both"}});
			await consumeResource(actor, resKey, 1);
		}		
	}

} catch (err) {
    console.error(`${resourceName}: ${optionName} - ${version}`, err);
}

function findResource(actor) {
	for (let res in actor.data.data.resources) {
		if (actor.data.data.resources[res].label === resourceName) {
		  return res;
		}
    }
	
	return null;
}

// handle resource consumption
async function consumeResource(actor, resKey, cost) {
	if (actor && resKey && cost) {
		const points = actor.data.data.resources[resKey].value;
		const pointsMax = actor.data.data.resources[resKey].max;
		let resources = duplicate(actor.data.data.resources);
		resources[resKey].value = Math.clamped(points - cost, 0, pointsMax);
		await actor.update({"data.resources": resources});
	}
}
