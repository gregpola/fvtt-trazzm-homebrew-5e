// damage macro
const version = "12.3.0"
const optionName = "Cloudkill Damage";
const lastAppliedTimeFlag = "last-applied-cloudkill-flag";

try {
	const templateFlag = region.flags?.world?.spell?.Cloudkill;

	if (templateFlag) {
		const targetToken = event.data.token;

		if (HomebrewHelpers.isAvailableThisTurn(targetToken.actor, lastAppliedTimeFlag)) {
			const isDead = HomebrewHelpers.findEffect(targetToken.actor, "Dead");
			if (!isDead) {
				HomebrewHelpers.setUsedThisTurn(targetToken.actor, lastAppliedTimeFlag);

				const sourceToken = canvas.tokens.get(templateFlag.sourceTokenId);
				let damageItem = await HomebrewHelpers.getItemFromCompendium('fvtt-trazzm-homebrew-5e.homebrew-automation-items', 'Cloudkill Damage');
				if (damageItem) {
					let damageDice = 5;
					if (templateFlag?.castLevel) {
						damageDice += (templateFlag.castLevel - 5);
					}

					const damageRoll = `${damageDice}d8`;
					const saveDC = templateFlag?.saveDC ?? '13';

					const itemData = foundry.utils.mergeObject(foundry.utils.duplicate(damageItem), {
						type: "spell",
						effects: [],
						flags: {
							"midi-qol": {
								noProvokeReaction: true, // no reactions triggered
								onUseMacroName: null //
							},
						},
						system: {
							damage: {parts: [[damageRoll, 'poison']]},
							save: {dc: saveDC, ability: "con", scaling: "flat"}
						}
					}, {overwrite: true, inlace: true, insertKeys: true, insertValues: true});
					const item = new CONFIG.Item.documentClass(itemData, {parent: sourceToken.actor});

					let [config, options] = HomebrewHelpers.syntheticItemWorkflowOptions([targetToken.uuid]);
					await MidiQOL.completeItemUse(item, config, options);
					await HomebrewMacros.wait(250);
				}
				else {
					console.error(`${optionName}: ${version}`, 'Missing damage item');
				}
			}
		}
	}
	else {
		console.error(`${optionName}: ${version}`, 'Missing template flag');
	}
}
catch (err) {
	console.error(`${optionName}: ${version}`, err);
}
