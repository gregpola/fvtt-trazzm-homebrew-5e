/*
	For the duration, no sound can be created within or pass through a 20-foot-radius sphere centered on a point you
	choose within range. Any creature or object entirely inside the sphere is immune to thunder damage, and creatures
	are Deafened while entirely inside it. Casting a spell that includes a verbal component is impossible there.
*/
const version = "12.3.0";
const optionName = "Silence";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const templateFLag = "silence-template";

try {
	if (args[0].macroPass === "preItemRoll") {
		Hooks.once("createMeasuredTemplate", async (template) => {
			let radius = canvas.grid.size * (template.distance / canvas.grid.distance);
			await actor.setFlag(_flagGroup, templateFLag, {templateUuid: template.uuid});
		});
	}
	else if (args[0] === "off") {
		let flag = actor.getFlag(_flagGroup, templateFLag);
		if (flag) {
			await actor.unsetFlag(_flagGroup, templateFLag);

			const template = await fromUuidSync(flag.templateUuid);
			if (template) {
				await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [template.id]);
			}
		}
	}

} catch (err) {
	console.error(`${optionName} : ${version}`, err);
}


// enter
let effect = HomebrewHelpers.findEffect(event.data.token?.actor, 'Silence Effect');
if (!effect) {
	let effectData = {
		name: 'Silence Effect',
		icon: 'icons/magic/symbols/runes-triangle-orange.webp',
		changes: [
			{
				key: 'flags.midi-qol.fail.spell.vocal',
				mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
				value: true,
				priority: 20
			},
			{
				key: 'system.traits.di.value',
				mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
				value: 'thunder',
				priority: 20
			}
		],
		origin: origin
	};

	await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: event.data.token.actor.uuid, effects: [effectData]});
}

// exit
let effect = HomebrewHelpers.findEffect(event.data.token?.actor, 'Silence Effect');
if (effect) {
	await MidiQOL.socket().executeAsGM("removeEffects", {actorUuid: event.data.token.actor.uuid, effects: [effect.id]});
}
