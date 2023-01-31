const version = "10.0.0";
const optionName = "Bounding Boulder";

const lastArg = args[args.length - 1];

try {
	if (args[0].macroPass === "postActiveEffects") {
		let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		const actorToken = await canvas.tokens.get(lastArg.tokenId);
		let template = fromUuidSync(lastArg.templateUuid);
		if (template) {
			await anime(actorToken, template);
		}
		
		// handle the strength saves or be knocked prone
		let targets = args[0].failedSaves;
		if (targets && targets.length > 0) {
			const saveDC = actor.system.attributes.spelldc;
			const saveFlavor = `${CONFIG.DND5E.abilities["str"]} DC${saveDC} ${optionName}`;
			
			for(let target of targets) {
				let targetToken = game.canvas.tokens.get(target.id);
				
				if (targetToken) {
					let saveRoll = await targetToken.actor.rollAbilitySave("str", {saveFlavor});
					await game.dice3d?.showForRoll(saveRoll);
					
					if (saveRoll.total < saveDC) {
						let isProne = await game.dfreds?.effectInterface.hasEffectApplied('Prone', targetToken.actor.uuid);
						if (!isProne) {
							const uuid = target.actor.uuid;
							await game.dfreds?.effectInterface.addEffect({ effectName: 'Prone', uuid });
						}
					}
				}
			}
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function anime(token, template) {
	new Sequence()
		.effect()
		.file("jb2a.boulder.toss.01.60ft")
		.fadeIn(500)
		.fadeOut(300)
		.atLocation(token)
		.stretchTo(template)
		.play();
}
