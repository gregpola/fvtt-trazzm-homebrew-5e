/*
	When a creature you can see hits you with an attack roll, you can use your reaction to force that creature to reroll. Once you use this ability, you can’t use it again until you roll initiative at the start of combat or until you finish a short or long rest.
*/
const version = "10.0.0";
const optionName = "Second Chance";
const timeFlag = "second-chance-time";
// ItemMacro.Compendium.fvtt-trazzm-homebrew-5e.homebrew-feats.4cMffQIA1wKYygJy

try {
	if (args[0].macroPass === "isHit") {	
		const lastArg = args[args.length - 1];
		const actor = lastArg.options?.actor;
		const token = lastArg.options?.token;
		const target = fromUuidSync(lastArg.tokenUuid);
		if (!actor || !token || !target) return;

		if (isAvailableThisTurn() && game.combat) {
			const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
			await actor.setFlag('midi-qol', timeFlag, `${combatTime}`);

			const workflow = MidiQOL.Workflow.getWorkflow(lastArg.uuid);
			setProperty(workflow, 'aborted', true);

			// re-roll the attack
			const cloneItem = new CONFIG.Item.documentClass(workflow.item, { parent: target.actor });
			await MidiQOL.completeItemUse(cloneItem, workflow.config, lastArg.workflowOptions);
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

function isAvailableThisTurn() {
	if (game.combat) {
		const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
		const lastTime = actor.getFlag("midi-qol", timeFlag);
		if (combatTime === lastTime) {
			return false;
		}
		
		return true;
	}
	return false;
}

/*
		
		// check if already used reaction
		const usedReaction = await game.dfreds.effectInterface.hasEffectApplied('Reaction', actor.uuid);
		if (usedReaction) {
			console.log(`${optionName} - not available, no reaction`);
			return;
		}
		
		// check for avilable uses
		let featureItem = actor.items.getName(optionName);
		let uses = featureItem?.system?.uses?.value ?? 0;
		if (!uses) {
			console.log(`${optionName} - no uses available`);
			return;
		}



const options = {
    showFullCard: false,
    createWorkflow: true,
    targetUuids: aoeTargetsArr,
    configureDialog: false,
    versatile: false,
    workflowOptions: {}
};

const item = new CONFIG.Item.documentClass(damageItem, { parent: actor });
await MidiQOL.completeItemUse(item, {}, options);
		
		// TODO check reaction, uses and decrement
		let oldRoll = lastArg.workflow.attackRoll.terms[0].results[0].result;
		let oldTotal = lastArg.workflow.attackTotal;
		
		let newAttackRoll = new Roll(`1d20`).evaluate({ async: false });
		await game.dice3d?.showForRoll(newAttackRoll);

		if (newAttackRoll.total < oldRoll) {
			const newAttackTotal = lastArg.workflow.attackTotal + newAttackRoll.total - oldRoll;
			setProperty(lastArg.workflow, "attackTotal", newAttackTotal);
			//lastArg.workflow.attackRoll.terms[0].results[0].result = newAttackRoll.total;
			//lastArg.workflow.attackTotal = lastArg.workflow.attackTotal + newAttackRoll.total - oldRoll;
			console.log(lastArg.workflow.attackRoll);
			console.log(lastArg.workflow.attackTotal);
		}
*/