const version = "0.1.0";

try {
	new Dialog({
	  title: "Shove Action",
	  content: "Which Shove Action?",
	  buttons: {
		A: { label: "Shove (Prone)", callback: () => { return ShoveProne(); } },
		B: { label: "Shove (Knockback)", callback: () => { return ShoveKnockback(); } },
	  }
	}).render(true);

} catch (err) {
    console.error(`Shield Master shove ${version}`, err);
}

async function ShoveProne(){
	let shover = canvas.tokens.get(args[0].tokenId);
	let defender = Array.from(game.user.targets)[0];
	ChatMessage.create({'content': `${shover.name} tries to shove ${defender.name} to the ground!`})
	let tactorRoll = await shover.actor.rollSkill("ath");
	let skill = defender.actor.data.data.skills.ath.total < defender.actor.data.data.skills.acr.total ? "acr" : "ath";
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
	const knockbackPixels = canvas.grid.size;
	const targetDoc = targetToken.document;

	const ray = new Ray(sourceToken.center, targetDoc.object.center);
	let newCenter = ray.project((ray.distance + knockbackPixels)/ray.distance);
	const isAllowedLocation = canvas.sight.testVisibility({x: newCenter.x, y: newCenter.y}, {object: targetDoc.Object});
	if(!isAllowedLocation) return ChatMessage.create({content: `${targetDoc.name} hits a wall`});
	newCenter = canvas.grid.getSnappedPosition(newCenter.x - targetDoc.object.w / 2, newCenter.y - targetDoc.object.h / 2, 1);
	const mutationData = { token: {x: newCenter.x, y: newCenter.y}};
	await warpgate.mutate(targetDoc, mutationData, {}, {permanent: true});
}