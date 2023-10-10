// https://github.com/gregpola/fvtt-trazzm-homebrew-5e/releases/latest/download/module.json
const resourceName = "Superiority Dice";

/*
	
*/
const version = "10.0.0";
const optionName = "Precision";

try {
	console.info("%c fvtt-trazzm-homebrew-5e", "color: #D030DE", " | Bag of Tricks (Gray)");
	// actor
	// token
	const theItem = scope.item;
	if (!["mwak", "rwak", "msak", "rsak"].includes(workflow.item.system.actionType)) {










	ui.notifications.error(`${optionName}: ${resourceName}: - no resource found`);

} catch (err) {
	console.error(`${optionName}: ${version}`, err);
}







	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);

	const targetActor = lastArg.hitTargets[0].actor;
	const targetToken = game.canvas.tokens.get(lastArg.hitTargets[0].id);
	const targetActor = lastArg.targets[0].actor;
	const targetToken = game.canvas.tokens.get(lastArg.targets[0].id);

	const item = fromUuid(lastArg.origin);
	const sourceItem = fromUuid(lastArg.sourceItemUuid);
	
	const workflow = MidiQOL.Workflow.getWorkflow(lastArg.uuid);
	spell-hideous-laughter.js



	const druidLevel = actor.classes.druid?.system.levels ?? 0;
	const pb = actor.system.attributes.prof;
	const actorDC = actor.system.attributes.spelldc ?? 12;
	actor.system.abilities.cha.mod;
	
	macro.tokenMagic
	system.attributes.exhaustion = 2;
	system.attributes.ac.bonus

	let saveRoll = await targetActor.rollAbilitySave("con", {flavor: saveFlavor});

	await game.dice3d?.showForRoll(saveRoll);
	
	if (!["mwak", "rwak", "msak", "rsak", "save", "heal"].includes(lastArg.itemData.system.actionType)) {
		
	// bluish color
	// #5570B8
	
	await game.dfreds.effectInterface.removeEffect({effectName: 'Incapacitated', uuid:actor.uuid});

	ui.notifications.error(`${optionName}: ${resourceName}: - no resource found`);

	ChatMessage.create({
		content: `${actorToken.name}'s ${selectedItem.name} is blessed with positive energy`,
		speaker: ChatMessage.getSpeaker({ actor: actor })});
		
	// Hit point level values
	targetTokenDoc.actor.classes.barbarian.advancement.byType.HitPoints (array, first has the hp rolls)
	
// vertime setup to remove a condition on save
turn=end, saveAbility=wis, saveDC=19, label=Frightened
turn=end, saveAbility=wis, saveDC=19, label=Stunned
turn=end, saveAbility=con, saveDC=12, label=Poisoned
turn=start, damageRoll=2d6, damageType=poison, label=Constricted
turn=start, damageRoll=10, damageType=radiant, label=Holy Nimbus

flags.midi-qol.optional.BardicInspiration.ac

// options = { maxSize: undefined, includeIncapacitated: false, canSee: false }
let secondTarget = await MidiQOL.findNearby(CONST.TOKEN_DISPOSITIONS.FRIENDLY, ttoken, 5, {canSee: true});


// Monks token bar
let message = await game.MonksTokenBar.requestRoll([targetToken], {request:'save:con', flavor: 'Poisoned weapon', silent: true});
await wait(10000);
let tokenid = 'token' + targetToken.id;
saveTotal = message.flags["monks-tokenbar"][tokenid].total;


"fvtt-trazzm-homebrew-5e.homebrew-items"


async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }

async function findEffect(actor, effectName) {
    let effect = null;
    effect = actor?.effects.find(ef => ef.label === effectName);
    return effect;
}

function hasEffectApplied(effectName, actor) {
  return actor.effects.find((ae) => ae.label === effectName) !== undefined;
}

async function findEffect(actor, effectName, origin) {
    let effect = null;
    effect = actor?.effects?.find(ef => ef.label === effectName && ef.origin === origin);
    return effect;
}

async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); });}

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
		resources[resKey].value = Math.clamped(value - cost, 0, max);
		await actor.update({ "system.resources": resources });
		return true;
	}
}

// Check to make sure the actor hasn't already applied the damage this turn
function isAvailableThisTurn() {
	if (game.combat) {
		const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn / 100}`;
		const lastTime = actor.getFlag("midi-qol", timeFlag);
		if (combatTime === lastTime) {
			return false;
		}
		return true;
	}	
	return false;
}
