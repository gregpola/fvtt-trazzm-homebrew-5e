const version = "10.0.0";
const optionName = "Shield Master";
const lastArg = args[args.length - 1];

try {
	new Dialog({
	  title: `${optionName} - Shove`,
	  content: "Which Shove Action?",
	  buttons: {
		A: { label: "Shove (Prone)", callback: () => { return ShoveProne(); } },
		B: { label: "Shove (Knockback)", callback: () => { return ShoveKnockback(); } },
	  }
	}).render(true);

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function ShoveProne(){
	let shover = canvas.tokens.get(args[0].tokenId);
	let defender = Array.from(game.user.targets)[0];
	ChatMessage.create({'content': `${shover.name} tries to shove ${defender.name} to the ground!`})
	let tactorRoll = await shover.actor.rollSkill("ath");
	let skill = defender.actor.system.skills.ath.total < defender.actor.system.skills.acr.total ? "acr" : "ath";
	let tokenRoll = await defender.actor.rollSkill(skill);
	if (tactorRoll.total >= tokenRoll.total) {
		ChatMessage.create({'content': `${shover.name} knocks ${defender.name} prone!`});
		const uuid = defender.actor.uuid;
		const hasEffectApplied = await game.dfreds.effectInterface.hasEffectApplied('Prone', uuid);
		if (!hasEffectApplied) {
			 await game.dfreds?.effectInterface.addEffect({ effectName: 'Prone', uuid });
		}
	}
	else {
		ChatMessage.create({'content': `${shover.name} fails to overcome ${defender.name} defenenses`});
	}
}

async function ShoveKnockback(){
	let pusher = canvas.tokens.get(args[0].tokenId);
	let target = Array.from(game.user.targets)[0];
	ChatMessage.create({'content': `${pusher.name} tries to shove ${target.name} back 5 feet!`})
	let tactorRoll = await pusher.actor.rollSkill("ath");
	let skill = target.actor.system.skills.ath.total < target.actor.system.skills.acr.total ? "acr" : "ath";
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
	const knockbackPixels = canvas.grid.size;
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
