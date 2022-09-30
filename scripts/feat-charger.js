const version = "0.1.0";
let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
let actor = workflow?.actor;

try {
	// verify needed data
	if (!game.combat || !actor) {
		console.error("Missing data for Charger");
		return;
	}
	
	// Ask which option they want to take
	new Dialog({
	  title: "Charger Action",
	  content: "Which option do you want?",
	  buttons: {
		A: { label: "+5 damage bonus", callback: () => { return DamageBonus(); } },
		B: { label: "Push target 10ft", callback: () => { return ShoveKnockback(); } },
	  }
	}).render(true);

} catch (err) {
    console.error(`Charger feat ${version}`, err);
}

async function DamageBonus(){
	const effect_sourceData = {
		changes: [{ key: "data.bonuses.mwak.damage", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: +5, priority: 20 }
		],
		origin: args[0].itemUuid,
		duration: game.combat ? { rounds: 1, turns:0, startRound: `${game.combat.round}`, startTurn: `${game.combat.turn}`, startTime: `${game.time.worldTime}`} : {seconds: 6, startTime: `${game.time.worldTime}`},
		icon: "systems/dnd5e/icons/skills/weapon_42.jpg",
		label: "Charger feat - Bonus to damage",
		flags: {dae: {specialDuration: ['DamageDealt']}},
	}
	if (actor.effects.find(i=>i.data.label==="Charger feat - Bonus to damage")) {
		let effect = actor.effects.find(i=>i.data.label==="Charger feat - Bonus to damage");
		await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [effect.id] });
	}
	await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effect_sourceData] });
}

async function ShoveKnockback(){
	let pusher = canvas.tokens.get(args[0].tokenId);
	let target = Array.from(game.user.targets)[0];
	ChatMessage.create({'content': `${pusher.name} tries to push ${target.name} back 10 feet!`})
	let tactorRoll = await pusher.actor.rollSkill("ath");
	let skill = target.actor.data.data.skills.ath.total < target.actor.data.data.skills.acr.total ? "acr" : "ath";
	let tokenRoll = await target.actor.rollSkill(skill);
	if (tactorRoll.total >= tokenRoll.total) {
		await PushToken(pusher, target);
		ChatMessage.create({'content': `${pusher.name} pushes ${target.name} back!`});
	}
	else {
		ChatMessage.create({'content': `${pusher.name} is to weak, can't push ${target.name} back at all!`});
	}
}

async function PushToken(sourceToken, targetToken) {
	const knockbackPixels = 2 * canvas.grid.size;
	const targetDoc = targetToken.document;

	const ray = new Ray(sourceToken.center, targetDoc.object.center);
	let newCenter = ray.project((ray.distance + knockbackPixels)/ray.distance);
	
	// check for collision
	const isAllowedLocation = canvas.sight.testVisibility({x: newCenter.x, y: newCenter.y}, {object: targetDoc.Object});
	if(!isAllowedLocation) {
		// too far, check for 5-feet
		const shorterRay = new Ray(sourceToken.center, targetDoc.object.center);
		let shorterCenter = ray.project((ray.distance + (knockbackPixels/2))/ray.distance);
		const isShorterAllowed = canvas.sight.testVisibility({x: shorterCenter.x, y: shorterCenter.y}, {object: targetDoc.Object});
		
		if (!isShorterAllowed) {
			return ChatMessage.create({content: `${targetDoc.name} hits a wall`});
		}
		newCenter = shorterCenter;
	}
	
	// finish the push
	newCenter = canvas.grid.getSnappedPosition(newCenter.x - targetDoc.object.w / 2, newCenter.y - targetDoc.object.h / 2, 1);
	const mutationData = { token: {x: newCenter.x, y: newCenter.y}};
	await warpgate.mutate(targetDoc, mutationData, {}, {permanent: true});
}
