/*
Immediately after you hit a creature with a melee attack on your turn, you can expend one superiority die and then try to grapple the target as a bonus action (see the Player’s Handbook for rules on grappling). Add the superiority die to your Strength (Athletics) check. If successful, the target is Grappled.
*/
const version = "10.0.0";
const resourceName = "Superiority Dice";
const optionName = "Grappling Strike";

try {
	const lastArg = args[args.length - 1];
	let tactor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	
	if (args[0].macroPass === "preItemRoll") {
		// check resources
		let resKey = findResource(tactor);
		if (!resKey) {
			ui.notifications.error(`${resourceName} - no resource found`);
			return false;
		}

		// handle resource consumption
		return await consumeResource(tactor, resKey, 1);
	}
	else if (args[0].macroPass === "postActiveEffects") {
		let grappler = canvas.tokens.get(lastArg.tokenId);
		let defender = Array.from(game.user.targets)[0];
		
		// Attempt the grapple
		ChatMessage.create({'content': `${grappler.name} tries to grapple ${defender.name}`});
		const fullSupDie = tactor.system.scale["battle-master"]["superiority-die"];
		let tactorRoll = await grappler.actor.rollSkill("ath", { bonus: fullSupDie });
		
		let skill = defender.actor.system.skills.ath.total < defender.actor.system.skills.acr.total ? "acr" : "ath";
		let tokenRoll = await defender.actor.rollSkill(skill);
		await game.dice3d?.showForRoll(tokenRoll);

		if (tactorRoll.total >= tokenRoll.total) {
			ChatMessage.create({'content': `${grappler.name} grapples ${defender.name}!`});
			const uuid = defender.actor.uuid;
			await game.dfreds?.effectInterface.addEffect({ effectName: 'Grappled', uuid });
		}
		else {
			ChatMessage.create({'content': `${grappler.name} fails to grapple ${defender.name}`});
		}
	}

} catch (err) {
    console.error(`${resourceName}: ${optionName} - ${version}`, err);
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
