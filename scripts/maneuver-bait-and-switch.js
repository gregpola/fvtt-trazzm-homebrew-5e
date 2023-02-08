/*
	When you’re within 5 feet of a creature on your turn, you can expend one superiority die and switch places with that creature, provided you spend at least 5 feet of movement and the creature is willing and isn’t Incapacitated. This movement doesn’t provoke opportunity attacks.

	Roll the superiority die. Until the start of your next turn, you or the other creature (your choice) gains a bonus to AC equal to the number rolled.
*/
const version = "10.0.0";
const resourceName = "Superiority Dice";
const optionName = "Bait and Switch";
const gameRound = game.combat ? game.combat.round : 0;

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);
	
	if (args[0].macroPass === "preItemRoll") {
		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			ui.notifications.error(`${resourceName} - no resource found`);
			return false;
		}

		const points = actor.system.resources[resKey].value;
		if (!points) {
			ui.notifications.error(`${optionName} - resource pool is empty`);
			return false;
		}
		
		// check target
		if (lastArg.targets.length === 0) {
			ui.notifications.error(`${optionName} - no switch target selected`);
			return false;
		}

		// handle resource consumption
		return await consumeResource(actor, resKey, 1);
	}
	else if (args[0].macroPass === "postActiveEffects") {
		const targetActor = lastArg.targets[0].actor;
		const targetToken = game.canvas.tokens.get(lastArg.targets[0].id);
		
		// ask who gets the AC bpnus
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				title: optionName,
				content: "<p>Who gets the AC bonus?</p>",
				buttons:
				{
					me:
					{
						label: `${actor.name}`,
						callback: () => { resolve(actor) }
					},
					them:
					{
						label: `${targetActor.name}`,
						callback: () => { resolve(targetActor) }
					}
						}
			}).render(true);
		});
		let buffTarget = await dialog;
		
		if (!buffTarget) {
			buffTarget = actor;
		}

		// Apply the buff
		const fullSupDie = actor.system.scale["battle-master"]["superiority-die"];
		let bonusRoll = new Roll(`${fullSupDie.die}`).evaluate({ async: false });
		await game.dice3d?.showForRoll(bonusRoll);
		await applyArmorBonus(lastArg.uuid, buffTarget.uuid, bonusRoll.total);
		
		const actorCenter = { x: actorToken.center.x, y: actorToken.center.y };
		const targetCenter = { x: targetToken.center.x, y: targetToken.center.y };

		// Swap places
		const portalScale = actorToken.w / canvas.grid.size * 0.7;		
		new Sequence()
			.effect()
			.file("jb2a.misty_step.01.green")       
			.atLocation(actorToken)
			.scale(portalScale)
			.fadeOut(200)
			.wait(500)
			.animation()
			.on(actorToken)
			.teleportTo(targetCenter, { relativeToCenter: true })
			.fadeIn(200)
			.effect()
			.file("jb2a.misty_step.02.blue")
			.atLocation(targetToken)
			.scale(portalScale)
			.fadeOut(200)
			.wait(500)
			.animation()
			.on(targetToken)
			.teleportTo(actorCenter, { relativeToCenter: true })
			.fadeIn(200)
			.play();
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

async function applyArmorBonus(sourceOrigin, targetId, bonus) {

	const effectData = {
		label: optionName,
		icon: "icons/magic/control/energy-stream-link-large-white.webp",
		origin: sourceOrigin,
		changes: [
			{
				key: 'system.attributes.ac.bonus',
				mode: CONST.ACTIVE_EFFECT_MODES.ADD,
				value: bonus,
				priority: 20
			}
		],
		duration: { rounds: 1, turns: 2, startRound: gameRound, startTime: game.time.worldTime },
		flags: { 
			"dae": { 
				"token": targetId, 
				specialDuration: ["turnStartSource"] } 
		},
		disabled: false
	};
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetId, effects: [effectData] });
}