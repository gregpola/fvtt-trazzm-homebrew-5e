const version = "0.1.0";
const resourceName = "Superiority Dice";
const optionName = "Grappling Strike";

try {
	if (args[0] === "on") {
		let grappler = canvas.tokens.get(args[1].tokenId);
		let defender = Array.from(game.user.targets)[0];
		
		// check resources
		let resKey = findResource(grappler.actor);
		if (!resKey) {
			return ui.notifications.error(`${resourceName} - no resource found`);
		}

		const points = grappler.actor.data.data.resources[resKey].value;
		if (!points) {
			return ui.notifications.error(`${resourceName} - resource pool is empty`);
		}		
		consumeResource(grappler.actor, resKey, 1);
		
		// Attempt the grapple
		ChatMessage.create({'content': `${grappler.actor.name} tries to grapple ${defender.actor.name}`});
		const supDie = grappler.actor.data.data.scale["battle-master"]["superiority-die"];
		let tactorRoll = await grappler.actor.rollSkill("ath", { bonus: supDie });
		let skill = defender.actor.data.data.skills.ath.total < defender.actor.data.data.skills.acr.total ? "acr" : "ath";
		let tokenRoll = await defender.actor.rollSkill(skill);
		if (tactorRoll.total >= tokenRoll.total) {
			ChatMessage.create({'content': `${grappler.actor.name} grapples ${defender.actor.name}!`});
			const hasEffectApplied = await game.dfreds.effectInterface.hasEffectApplied('Grappled', defender.actor.uuid);
			if (!hasEffectApplied) {
				const uuid = defender.actor.uuid;
				await game.dfreds?.effectInterface.addEffect({ effectName: 'Grappled', uuid });
			}
		}
		else {
			ChatMessage.create({'content': `${grappler.actor.name} fails to grapple ${defender.actor.name}`});
		}
		
	}

} catch (err) {
    console.error(`Combat Maneuver: ${optionName} ${version}`, err);
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
