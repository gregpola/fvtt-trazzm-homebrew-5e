/*
	You touch a creature and bestow upon it a magical enhancement. Choose one of the following effects; the target gains
	that effect until the spell ends.

	- Bear’s Endurance. The target has advantage on Constitution Checks. It also gains 2d6 Temporary Hit Points, which are lost when the spell ends.
	- Bull’s Strength. The target has advantage on Strength Checks, and his or her carrying capacity doubles.
	- Cat’s Grace. The target has advantage on Dexterity Checks. It also doesn’t take damage from Falling 20 feet or less if it isn’t Incapacitated.
	- Eagle’s Splendor. The target has advantage on Charisma Checks.
	- Fox’s Cunning. The target has advantage on Intelligence Checks.
	- Owl’s Wisdom. The target has advantage on Wisdom Checks.

	At Higher Levels. When you cast this spell using a spell slot of 3rd level or higher, you can target one additional creature for each slot level above 2nd.
*/
const version = "12.3.0";
const optionName = "Enhance Ability";

const spellData = { bear: {name: 'Bear’s Endurance', ability: 'con'},
	bull: {name: 'Bull’s Strength', ability: 'str'},
	cat: {name: 'Cat’s Grace', ability: 'dex'},
	eagle: {name: 'Eagle’s Splendor', ability: 'cha'},
	fox: {name: 'Fox’s Cunning', ability: 'int'},
	owl: {name: 'Owl’s Wisdom', ability: 'wis'} };

try {
	if (args[0].macroPass === "postActiveEffects") {
		const spellLevel = workflow.castData.castLevel;
		const maxTargets = spellLevel - 1;
		let existingConcentration = MidiQOL.getConcentrationEffect(actor, item);

		let content = `
            <label><input type="radio" name="choice" value="bear" checked>  Bear’s Endurance </label>
            <label><input type="radio" name="choice" value="bull">  Bull’s Strength </label>
            <label><input type="radio" name="choice" value="cat">  Cat’s Grace </label>
            <label><input type="radio" name="choice" value="eagle">  Eagle’s Splendor </label>
            <label><input type="radio" name="choice" value="fox">  Fox’s Cunning </label>
            <label><input type="radio" name="choice" value="owl">  Owl’s Wisdom </label>
        `;

		let flavor = await foundry.applications.api.DialogV2.prompt({
			content: content,
			rejectClose: false,
			ok: {
				callback: (event, button, dialog) => {
					return button.form.elements.choice.value;
				}
			},
			window: {
				title: `${optionName} - Choose Flavor`,
			},
			position: {
				width: 400
			}
		});

		if (flavor) {
			const _data = spellData[flavor];

			const effectData = {
				name: `${optionName} - ${_data.name}`,
				icon: item.img,
				origin: workflow.item.uuid,
				changes: [
					{
						key: 'flags.midi-qol.advantage.ability.check.' + _data.ability,
						mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
						value: true,
						priority: 20
					}
				],
				disabled: false
			};

			let count = 0;
			for (let target of workflow.targets) {
				if (count >= maxTargets) break;
				let targetEffect = await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.actor.uuid, effects: [effectData] });

				if (existingConcentration) {
					await MidiQOL.socket().executeAsGM('addDependent', {concentrationEffectUuid: existingConcentration.uuid, dependentUuid: targetEffect[0].uuid});
				}

				if (flavor === 'bear') {
					const tempHpRoll = await new Roll('2d6').evaluate();
					await MidiQOL.applyTokenDamage(
						[{ damage: tempHpRoll.total, type: 'temphp' }],
						tempHpRoll.total,
						new Set([target]),
						null,
						null
					);
				}
			}
		}
	}
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
