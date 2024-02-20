/*
	When you’re within 5 feet of a creature on your turn, you can expend one superiority die and switch places with that
	creature, provided you spend at least 5 feet of movement and the creature is willing and isn’t incapacitated. This
	movement doesn’t provoke opportunity attacks.

	Roll the superiority die. Until the start of your next turn, you or the other creature (your choice) gains a bonus
	to AC equal to the number rolled.
*/
const version = "11.0";
const featureName = "Superiority Dice";
const optionName = "Bait and Switch";
const cost = 1;
const gameRound = game.combat ? game.combat.round : 0;

try {
	if (args[0].macroPass === "preItemRoll") {
		// check for available uses
		let featureItem = actor.items.find(i => i.name === featureName);
		if (featureItem) {
			let usesLeft = featureItem.system.uses?.value ?? 0;
			if (!usesLeft || usesLeft < cost) {
				console.error(`${optionName} - not enough ${featureName} uses left`);
				ui.notifications.error(`${optionName} - not enough ${featureName} uses left`);
			}
			else {
				const newValue = featureItem.system.uses.value - cost;
				await featureItem.update({"system.uses.value": newValue});
				return true;
			}
		}
		else {
			console.error(`${optionName} - no ${featureName} item on actor`);
			ui.notifications.error(`${optionName} - no ${featureName} item on actor`);
		}

		ui.notifications.error(`${featureName} - feature not found`);
		return false;
	}
	else if (args[0].macroPass === "postActiveEffects") {
		const targetToken = workflow.targets.first();

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
						label: `${targetToken.actor.name}`,
						callback: () => { resolve(targetToken.actor) }
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
		await applyArmorBonus(item.uuid, buffTarget.uuid, bonusRoll.total);
		
		const actorCenter = { x: token.center.x, y: token.center.y };
		const targetCenter = { x: targetToken.center.x, y: targetToken.center.y };

		// Swap places
		const portalScale = token.w / canvas.grid.size * 0.7;
		new Sequence()
			.effect()
			.file("jb2a.misty_step.01.green")       
			.atLocation(token)
			.scale(portalScale)
			.fadeOut(200)
			.wait(500)
			.animation()
			.on(token)
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
    console.error(`${optionName} - ${version}`, err);
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