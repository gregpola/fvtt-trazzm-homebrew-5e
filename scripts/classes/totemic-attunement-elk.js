const version = "10.0.0";
const optionName = "Totemic Attunement - Elk";

try {
	if (args[0].macroPass === "preItemRoll") {
		const lastArg = args[args.length - 1];
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		const targetToken = game.canvas.tokens.get(lastArg.hitTargets[0].id);
		
		// make sure the actor is raging
		let rageEffect = actor.effects.find(i => i.label === "Rage");
		if (!rageEffect) {
			ui.notifications.error(`${optionName}: actor must be raging`);
			return false;
		}
		
		// make sure the target is large or smaller
		const tsize = targetToken.actor.system.traits.size;
		if (!["tiny","sm","med","lg"].includes(tsize)) {
			ui.notifications.error(`${optionName}: target is too large to trip`);
			return false;
		}
		
		// make sure they have a bonus action
		const usedBonusAction = await game.dfreds.effectInterface.hasEffectApplied('Bonus Action', actor.uuid);
		if (usedBonusAction) {
			ui.notifications.error(`${optionName}: already used bonus action`);
			return false;
		}
		
		await game.dfreds?.effectInterface.addEffect({ effectName: 'Bonus Action', uuid: actor.uuid });
		return true;
	}

} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
