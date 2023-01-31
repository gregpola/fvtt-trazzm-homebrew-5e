/*
When you use your action to Dash, you can use a bonus action to make one melee weapon attack or to shove a creature.

If you move at least 10 feet in a straight line immediately before taking this bonus action, you either gain a +5 bonus to the attack’s damage roll (if you chose to make a melee attack and hit) or push the target up to 10 feet away from you (if you chose to shove and you succeed).
*/
const version = "10.0.0";
const optionName = "Charger";
const lastArg = args[args.length - 1];
let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
let target = Array.from(game.user.targets)[0];

try {
	
	// Ask which option they want to take
	new Dialog({
	  title: `${optionName}`,
	  content: "Which action do you want to take?",
	  buttons: {
		A: { label: "Melee Weapon Attack", callback: () => { return MeleeAttack(); } },
		B: { label: "Shove (Prone)", callback: () => { return ShoveProne(); } },
		C: { label: "Shove (Push)", callback: () => { return ShoveKnockback(); } },
	  }
	}).render(true);

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function MeleeAttack() {
	// TODO check movement
	const effect_sourceData = {
		changes: [{ key: "system.bonuses.mwak.damage", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: +5, priority: 20 }
		],
		origin: lastArg.itemUuid,
		duration: game.combat ? { rounds: 1, turns:0, startRound: `${game.combat.round}`, startTurn: `${game.combat.turn}`, startTime: `${game.time.worldTime}`} : {seconds: 6, startTime: `${game.time.worldTime}`},
		icon: "icons/creatures/mammals/deer-movement-leap-green.webp",
		label: "Charger feat - Bonus to damage",
		flags: {dae: {specialDuration: ['DamageDealt']}},
	}
	
	if (actor.effects.find(i=>i.label==="Charger feat - Bonus to damage")) {
		let effect = actor.effects.find(i=>i.label==="Charger feat - Bonus to damage");
		await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [effect.id] });
	}
	
	await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effect_sourceData] });
}

async function ShoveKnockback() {
	// TODO check movement for bonus distance
	let squaresPushed = 2;
	let actorRoll = await actor.rollSkill("ath");
	await game.dice3d?.showForRoll(actorRoll);

	let skill = target.actor.system.skills.ath.total < target.actor.system.skills.acr.total ? "acr" : "ath";
	let tokenRoll = await target.actor.rollSkill(skill);
	await game.dice3d?.showForRoll(tokenRoll);
	
	if (actorRoll.total >= tokenRoll.total) {
		await PushToken(actor, target, squaresPushed);
		ChatMessage.create({'content': `${pusher.name} pushes ${target.name} back!`});
	}
	else {
		ChatMessage.create({'content': `${pusher.name} is to weak to push ${target.name} back!`});
	}
}

async function PushToken(sourceToken, targetToken, squares) {
	const knockbackPixels = squares * canvas.grid.size;
	const ray = new Ray(sourceToken.center, targetToken.center);
	let newCenter = ray.project((ray.distance + knockbackPixels)/ray.distance);
	
	// check for collision
	const isAllowedLocation = canvas.effects.visibility.testVisibility({x: newCenter.x, y: newCenter.y}, {object: targetToken});
	if(!isAllowedLocation) {
		// too far, check for 5-feet
		let shorterCenter = ray.project((ray.distance + (knockbackPixels/2))/ray.distance);
		const isShorterAllowed = canvas.effects.visibility.testVisibility({x: shorterCenter.x, y: shorterCenter.y}, {object: targetToken});
		
		if (!isShorterAllowed) {
			return ChatMessage.create({content: `${targetToken.name} hits a wall`});
		}
		newCenter = shorterCenter;
	}
	
	// finish the push
	newCenter = canvas.grid.getSnappedPosition(newCenter.x - targetToken.width / 2, newCenter.y - targetToken.height / 2, 1);
	const mutationData = { token: {x: newCenter.x, y: newCenter.y}};
	await warpgate.mutate(targetToken.document, mutationData, {}, {permanent: true});
}

async function ShoveProne() {
	let actorRoll = await actor.rollSkill("ath");
	await game.dice3d?.showForRoll(actorRoll);

	let skill = target.actor.system.skills.ath.total < target.actor.system.skills.acr.total ? "acr" : "ath";
	let tokenRoll = await target.actor.rollSkill(skill);
	await game.dice3d?.showForRoll(tokenRoll);
	
	if (actorRoll.total >= tokenRoll.total) {
		ChatMessage.create({'content': `${actor.name} knocks ${target.name} prone!`});
		const uuid = target.actor.uuid;
		const hasEffectApplied = await game.dfreds.effectInterface.hasEffectApplied('Prone', uuid);
		if (!hasEffectApplied) {
			 await game.dfreds?.effectInterface.addEffect({ effectName: 'Prone', uuid });
		}
	}
}
