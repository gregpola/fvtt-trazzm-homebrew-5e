/*
	
*/
const version = "11.0";
const optionName = "Precision";

try {

} catch (err) {
	console.error(`${optionName}: ${version}`, err);
}

console.info("%c fvtt-trazzm-homebrew-5e", "color: #D030DE", " | Bag of Tricks (Gray)");
ui.notifications.error(`${optionName}: ${resourceName}: - no resource found`);

// Useful ereferences
if (!["mwak", "rwak", "msak", "rsak"].includes(workflow.item.system.actionType)) {

const tsize = targetTokenDoc.actor.system.traits.size;
if (!["tiny","sm","med","lg"].includes(tsize)) {

		const rogueLevels = actor.getRollData().classes?.rogue?.levels;
const pb = actor.system.attributes.prof;
const actorDC = actor.system.attributes.spelldc ?? 12;
const spellcastingAbility = actor.system.attributes.spellcasting;
const abilityBonus = actor.system.abilities[spellcastingAbility].mod;

item.system.prof.hasProficiency



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

// Check if there is an enemy of the target adjacent to it
function checkAllyNearTarget(token, targetToken) {
	let allNearby = MidiQOL.findNearby(token.document.disposition, targetToken, 5);
	let nearbyFriendlies = allNearby.filter(i => (i !== token));
	return (nearbyFriendlies.length > 0);
}




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

await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: originalActor.uuid, effects: [itemEffect.id] });

async function findEffect(actor, effectName) {
    let effect = null;
    effect = actor?.effects.find(ef => ef.name === effectName);
    return effect;
}

function hasEffectApplied(effectName, actor) {
  return actor.effects.find((ae) => ae.name === effectName) !== undefined;
}

async function findEffect(actor, effectName, origin) {
    let effect = null;
    effect = actor?.effects?.find(ef => ef.name === effectName && ef.origin === origin);
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
