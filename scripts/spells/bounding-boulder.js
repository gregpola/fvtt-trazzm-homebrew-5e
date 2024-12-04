/*
	You summon a 3-foot diameter boulder that travels 60 feet in a straight line of your choosing. The boulder vanishes after reaching the extent of the range. If a creature is in the boulder's path, they must make a Dexterity saving throw to avoid the impact or take 1d6 bludgeoning damage. If the struck creature is of medium or smaller size they must make a Strength saving throw or be knocked Prone.

	This spell’s damage increases by 1d6 when you reach 5th level (2d6), 11th level (3d6), and 17th level (4d6).
*/
const version = "12.3.0";
const optionName = "Bounding Boulder";

try {
	if (args[0].macroPass === "postActiveEffects") {
		const template = await fromUuidSync(args[0].templateUuid);
		if (template) {
			await anime(token, template);
		}
		
		// handle the strength saves or be knocked prone
		let targets = workflow.failedSaves;
		if (targets && targets.length > 0) {
			const saveDC = actor.system.attributes.spelldc;
			const saveFlavor = `${CONFIG.DND5E.abilities["str"].label} DC${saveDC} ${optionName}`;
			
			for(let target of targets) {
				let targetToken = game.canvas.tokens.get(target.id);
				
				if (targetToken) {
					let saveRoll = await targetToken.actor.rollAbilitySave("str", {flavor: saveFlavor, damageType: "bludgeoning"});
					await game.dice3d?.showForRoll(saveRoll);
					
					if (saveRoll.total < saveDC) {
						await animeTokenImpact(targetToken);
						await HomebrewMacros.wait(500);
						await HomebrewEffects.applyProneEffect(targetToken.actor, workflow.item.uuid);
					}
				}
			}
		}

		if (template) {
			await HomebrewMacros.wait(500);
			await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [template.id]);
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function anime(token, template) {
	new Sequence()
		.effect()
		.file("jb2a.boulder.toss.01.01.60ft")
		.fadeIn(100)
		.fadeOut(500)
		.atLocation(token)
		.stretchTo(template)
		.play();
}

async function animeTokenImpact(token) {
	new Sequence()
		.effect()
		.file("jb2a.impact.boulder.01")
		.atLocation(token)
		.fadeOut(500)
		.wait(500)
		.play();
}
