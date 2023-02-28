const version = "10.0.0";
const optionName = "Totemic Attunement - Wolf";

try {
	if (args[0].macroPass === "DamageBonus") {
		const lastArg = args[args.length - 1];
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		const targetToken = game.canvas.tokens.get(lastArg.hitTargets[0].id);

		// make sure it's an allowed attack
		if (!["mwak"].includes(lastArg.itemData.system.actionType)) {
			console.log(`${optionName}: not an eligible attack`);
			return {};
		}
		
		// make sure the actor is raging
		let rageEffect = actor.effects.find(i => i.label === "Rage");
		if (!rageEffect) {
			console.log(`${optionName}: actor must be raging`);
			return {};
		}
		
		// make sure the target is large or smaller
		const tsize = targetToken.actor.system.traits.size;
		if (!["tiny","sm","med","lg"].includes(tsize)) {
			console.log(`${optionName}: target is too large to trip`);
			return {};
		}
		
		// make sure they have a bonus action
		const usedBonusAction = await game.dfreds.effectInterface.hasEffectApplied('Bonus Action', actor.uuid);
		if (usedBonusAction) {
			console.log(`${optionName}: already used bonus action`);
			return {};
		}
		
		// ask if they want to use the option
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `${optionName}`,
				content: `<p>Use a bonus action to knock ${targetToken.name} prone?</p>`,
				buttons: {
					one: {
						icon: '<p> </p><img src = "icons/equipment/feet/boots-collared-simple-brown.webp" width="50" height="50"></>',
						label: "<p>Yes</p>",
						callback: () => resolve(true)
					},
					two: {
						icon: '<p> </p><img src = "icons/skills/melee/weapons-crossed-swords-yellow.webp" width="50" height="50"></>',
						label: "<p>No</p>",
						callback: () => { resolve(false) }
					}
				},
				default: "two"
			}).render(true);
		});
		
		let useManeuver = await dialog;
		if (useManeuver) {
			await game.dfreds?.effectInterface.addEffect({ effectName: 'Bonus Action', uuid: actor.uuid });
			
			const uuid = targetToken.actor.uuid;
			const hasEffectApplied = await game.dfreds.effectInterface.hasEffectApplied('Prone', uuid);
			if (!hasEffectApplied) {
				await game.dfreds?.effectInterface.addEffect({ effectName: 'Prone', uuid: uuid });
			}
		}
	}

} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
