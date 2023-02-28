const version = "10.0.1";
const optionName = "Light Spell";

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);

	if (args[0].macroPass === "preActiveEffects") {
		if (lastArg.workflow.targets.size > 0) {
			const targetToken = game.canvas.tokens.get(lastArg.workflow.targets.first().id);
			if (targetToken.actor?.type === "npc") {
				const saveDC = actor.system.attributes.spelldc;
				const saveFlavor = `${CONFIG.DND5E.abilities["dex"]} DC${saveDC} ${optionName}`;

				let saveRoll = await targetToken.actor.rollAbilitySave("dex", {flavor: saveFlavor, damageType: "light"});
				await game.dice3d?.showForRoll(saveRoll);
				
				if (saveRoll.total >= saveDC) {
					lastArg.workflow.targets.delete(targetToken);
				}
			}
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
