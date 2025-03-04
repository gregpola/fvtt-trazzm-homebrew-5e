/*
	Whenever you assume your starry form, choose which of the following constellations glimmers on your body; your
	choice gives you certain benefits while in the form:

	Archer. A constellation of an archer appears on you. When you activate this form, and as a bonus action on your
	subsequent turns while it lasts, you can make a ranged spell attack, hurling a luminous arrow that targets one
	creature within 60 feet of you. On a hit, the attack deals radiant damage equal to 1d8 + your Wisdom modifier.

	Chalice. A constellation of a life-giving goblet appears on you. Whenever you cast a spell using a spell slot that
	restores hit points to a creature, you or another creature within 30 feet of you can regain hit points equal to
	1d8 + your Wisdom modifier.

	Dragon. A constellation of a wise dragon appears on you. When you make an Intelligence or a Wisdom check or a
	Constitution saving throw to maintain concentration on a spell, you can treat a roll of 9 or lower on the d20 as a 10.
*/
const version = "12.3.0";
const optionName = "Starry Form";

const archerItemName = "Starry Form - Archer";
const archerItemId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-items.Item.032OsGh5UYBUoy6H";

const chaliceItemName = "Starry Form - Chalice";
const chaliceItemId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-items.Item.GlzTlPpePMNjmir8";

const dragonEffectName = "Starry Form - Dragon";
const fullOfStarsffectName = "Full of Stars";
const druidLevel = actor.system.classes?.druid?.levels ?? 0;

try {
	if (args[0] === "on") {
		// Ask which form to take and apply it
		let starryForm = await pickStarryForm();
		if (starryForm) {
			await applyStarryForm(starryForm);

			const fullOfStarsItem = actor.items.find(i => i.name === fullOfStarsffectName);
			if (fullOfStarsItem) {
				for (let eff of fullOfStarsItem.effects) {
					await eff.update({disabled: false});
				}
			}
		}
	}
	else if (args[0] === "off") {
		const archerItem = actor.items.find(i => i.name === archerItemName);
		if (archerItem) {
			await actor.deleteEmbeddedDocuments('Item', [archerItem.id]);
		}

		const chaliceItem = actor.items.find(i => i.name === chaliceItemName);
		if (chaliceItem) {
			await actor.deleteEmbeddedDocuments('Item', [chaliceItem.id]);
		}

		await HomebrewEffects.removeEffectByName(actor, dragonEffectName);

		const fullOfStarsItem = actor.items.find(i => i.name === fullOfStarsffectName);
		if (fullOfStarsItem) {
			for (let eff of fullOfStarsItem.effects) {
				await eff.update({disabled: true});
			}
		}
	}
	else if (args[0] === "each") {
		if (druidLevel > 9) {
			let archerItem = actor.items.find(f => f.name === archerItemName );
			let chaliceItem = actor.items.find(f => f.name === chaliceItemName );
			let dragonEffect = actor.effects.find(i => i.label === dragonEffectName);
			let currentFormName = archerItem ? "archer" : (chaliceItem ? "chalice" : "dragon");

			let starryForm = await pickStarryForm();
			if (starryForm) {
				if (!currentFormName.equals(starryForm)) {
					// apply new form
					await applyStarryForm(starryForm);

					// remove old form
					if (archerItem) {
						await actor.deleteEmbeddedDocuments('Item', [archerItem.id]);
					}

					if (chaliceItem) {
						await actor.deleteEmbeddedDocuments('Item', [chaliceItem.id]);
					}

					if (dragonEffect) {
						await HomebrewEffects.removeEffectByName(actor, dragonEffectName);
					}

				}
				else {
					ui.notifications.warn(`${optionName} - no change, picked the same form`);
				}
			}
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyStarryForm(starryForm) {
	let favoriteItem;

	switch (starryForm) {
		case 'archer':
			let archerItem = await fromUuid(archerItemId);
			await actor.createEmbeddedDocuments('Item',[archerItem]);
			favoriteItem = actor.items.find(i => i.name === archerItemName);
			if (favoriteItem) {
				await HomebrewHelpers.addFavorite(actor, favoriteItem);
			}
			break;

		case 'chalice':
			let chaliceItem = await fromUuid(chaliceItemId);
			await actor.createEmbeddedDocuments('Item',[chaliceItem]);
			break;

		case 'dragon':
			await applyDragonForm(token, item);
			break;
	}
}

async function pickStarryForm() {
	const content = `<p>Select the constellation to assume:</p>
		<label style="margin-bottom: 10px;"><input style="margin-right: 10px;" type="radio" name="choice" value="archer" checked /><img src='icons/skills/ranged/arrow-flying-ornate-gold.webp' width='30' height='30' style='border: 5px; vertical-align: middle;margin-right: 10px;'/>Archer</label>
		<label style="margin-bottom: 10px;"><input style="margin-right: 10px;" type="radio" name="choice" value="chalice"/><img src='icons/containers/kitchenware/goblet-jeweled-engraved-red-gold.webp' width='30' height='30' style='border: 5px; vertical-align: middle;margin-right: 10px;'/>Chalice</label>
		<label style="margin-bottom: 10px;"><input style="margin-right: 10px;" type="radio" name="choice" value="dragon"/><img src='icons/creatures/reptiles/dragon-horned-blue.webp' width='30' height='30' style='border: 5px; vertical-align: middle;margin-right: 10px;'/>Dragon</label>`;

	return await foundry.applications.api.DialogV2.prompt({
		content: content,
		rejectClose: false,
		ok: {
			callback: (event, button, dialog) => {
				return button.form.elements.choice.value;
			}
		},
		window: {
			title: `${optionName}`,
		},
		position: {
			width: 400
		}
	});
}

async function applyDragonForm(actorToken, origin) {
	const dragonEffectData = {
		name: dragonEffectName,
		icon: "icons/creatures/reptiles/dragon-horned-blue.webp",
		origin: origin,
		changes: [
			{
				key: 'flags.midi-qol.min.ability.check.int',
				mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
				value: '10',
				priority: 20
			},
			{
				key: 'flags.midi-qol.min.ability.check.wis',
				mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
				value: 10,
				priority: 20
			},
			{
				key: 'system.attributes.concentration.roll.min',
				mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
				value: 10,
				priority: 20
			}
		],
		disabled: false
	};
	
	if (druidLevel > 9) {
		dragonEffectData.changes.push({ key: "system.attributes.movement.fly", value: "20", mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE, priority: 25});
	}

	await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: actorToken.actor.uuid, effects: [dragonEffectData]});
}
