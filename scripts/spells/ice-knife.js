const version = "12.3.1";
const optionName = "Ice Knife"

try {
	if (args[0].macroPass === "postActiveEffects") {
		let targetToken = workflow.targets.first();

		let areaSpellData = foundry.utils.duplicate(item);
		const damageDice = 1 + workflow.castData.castLevel;

		delete areaSpellData.effects;
		delete areaSpellData.id;
		delete areaSpellData.flags["midi-qol"].onUseMacroName;
		delete areaSpellData.flags["midi-qol"].onUseMacroParts;
		if (foundry.utils.hasProperty(areaSpellData, "flags.itemacro")) delete areaSpellData.flags.itemacro;
		if (foundry.utils.hasProperty(areaSpellData, "flags.dae.macro")) delete areaSpellData.flags.dae.macro;

		areaSpellData.name = "Ice Knife: Explosion";
		areaSpellData.system.damage.parts = [[`${damageDice}d6[cold]`, "cold"]];
		areaSpellData.system.actionType = "save";
		areaSpellData.system.save.ability = "dex";
		areaSpellData.system.scaling = { mode: "level", formula: "1d6" };
		areaSpellData.system.preparation.mode = "atwill";
		areaSpellData.system.target.value = 99;

		foundry.utils.setProperty(areaSpellData, "flags.midiProperties.magicdam", true);
		foundry.utils.setProperty(areaSpellData, "flags.midiProperties.saveDamage", "nodam");
		foundry.utils.setProperty(areaSpellData, "flags.midiProperties.bonusSaveDamage", "nodam");

		const areaSpell = new CONFIG.Item.documentClass(areaSpellData, { parent: actor });
		areaSpell.prepareData();
		areaSpell.prepareFinalAttributes();

		const aoeTargets = MidiQOL
			.findNearby(null, targetToken, 5, { includeIncapacitated: true })
			.filter((possible) => {
				const collisionRay = new Ray(targetToken, possible);
				const collision = canvas.walls.checkCollision(collisionRay, {mode: "any", type: "light"});
				if (collision)
					return false;
				else
					return true;
			})
			.concat(targetToken)
			.map((t) => t.document.uuid);

		const [config, options] = HomebrewHelpers.syntheticItemWorkflowOptions(aoeTargets);
		await MidiQOL.completeItemUse(areaSpell, config, options);
		await anime(targetToken);
	}
}
catch (err) {
	console.error(`${optionName}: ${version}`, err);
}

async function anime(token) {
	new Sequence()
		.effect()
		.file("jb2a.ice_spikes.radial.burst.white")
		.atLocation(token)
		.scaleToObject(2)
		.fadeOut(500)
		.wait(500)
		.play();
}
