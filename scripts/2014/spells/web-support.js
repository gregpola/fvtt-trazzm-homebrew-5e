
// Token Enters
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let targetToken = event.data.token;
let effect = HomebrewHelpers.findEffect(targetToken.actor, 'In Webs');
if (!effect) {
	let effectData = {
		'name': 'In Webs',
		'icon': 'icons/creatures/webs/web-spider-caught-hand-purple.webp',
		'changes': [
			{
				'key': 'system.attributes.movement.walk',
				'mode': CONST.ACTIVE_EFFECT_MODES.MULTIPLY,
				'value': '0.5',
				'priority': 20
			},
			{
				'key': 'macro.tokenMagic',
				'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
				'value': 'simpleweb',
				'priority': 21
			}
		],
		'origin': origin,
		disabled: false
	};

	await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: targetToken.actor.uuid, effects: [effectData]});
}

const targetsTurn = game.combat.turns.findIndex(t => t.tokenId === targetToken.id);
if (targetsTurn && targetsTurn === game.combat.turn) {
	let stuckEffect = HomebrewHelpers.findEffect(targetToken.actor, 'Stuck In Webs');

	// roll dex save
	let spelldc = 14;
	let templateFlag = region.flags?.world?.spell?.Web;
	if (templateFlag) {
		spelldc = templateFlag.saveDC;
	}

	let saveRoll = await targetToken.actor.rollAbilitySave("dex", {flavor: "Resist webs - DC " + spelldc});
	await game.dice3d?.showForRoll(saveRoll);

	if (saveRoll.total < spelldc) {
		if (!stuckEffect) {
			let stuckEffectData = {
				'name': 'Stuck In Webs',
				'icon': 'icons/creatures/webs/web-spider-caught-hand-purple.webp',
				'changes': [
					{
						'key': 'macro.CE',
						'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
						'value': 'Restrained',
						'priority': 20
					},
					{
						'key': 'macro.createItem',
						'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
						'value': 'Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-items.Item.3GBSZ2RemODj1eBL',
						'priority': 21
					}
				],
				'origin': origin,
				disabled: false
			};

			await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: targetToken.actor.uuid, effects: [stuckEffectData]});
		}
	}
	else if (stuckEffect) {
		await MidiQOL.socket().executeAsGM("removeEffects", {actorUuid: targetToken.actor.uuid, effects: [stuckEffect.id]});
	}
}


// Move Out
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let effect = HomebrewHelpers.findEffect(event.data.token?.actor, 'In Webs');
if (effect) {
	await MidiQOL.socket().executeAsGM("removeEffects", {actorUuid: event.data.token.actor.uuid, effects: [effect.id]});
}

let stuckEffect = HomebrewHelpers.findEffect(event.data.token?.actor, 'Stuck In Webs');
if (stuckEffect) {
	await MidiQOL.socket().executeAsGM("removeEffects", {actorUuid: event.data.token.actor.uuid, effects: [stuckEffect.id]});
}

// Turn Start
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let targetActor = event.data.token?.actor;
let effect = HomebrewHelpers.findEffect(targetActor, 'In Webs');
if (!effect) {
	let effectData = {
		'name': 'In Webs',
		'icon': 'icons/creatures/webs/web-spider-caught-hand-purple.webp',
		'changes': [
			{
				'key': 'system.attributes.movement.walk',
				'mode': CONST.ACTIVE_EFFECT_MODES.MULTIPLY,
				'value': '0.5',
				'priority': 20
			},
			{
				'key': 'macro.tokenMagic',
				'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
				'value': 'simpleweb',
				'priority': 21
			}
		],
		'origin': origin,
		disabled: false
	};

	await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: targetActor.uuid, effects: [effectData]});
}

// roll dex save
let spelldc = 14;
let templateFlag = region.flags?.world?.spell?.Web;
if (templateFlag) {
	spelldc = templateFlag.saveDC;
}

let saveRoll = await targetActor.rollAbilitySave("dex", {flavor: "Resist webs - DC " + spelldc});
await game.dice3d?.showForRoll(saveRoll);
let stuckEffect = HomebrewHelpers.findEffect(targetActor, 'Stuck In Webs');
if (saveRoll.total < spelldc) {
	if (!stuckEffect) {
		let stuckEffectData = {
			'name': 'Stuck In Webs',
			'icon': 'icons/creatures/webs/web-spider-caught-hand-purple.webp',
			'changes': [
				{
					'key': 'macro.CE',
					'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
					'value': 'Restrained',
					'priority': 20
				},
				{
					'key': 'macro.createItem',
					'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
					'value': 'Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-items.Item.3GBSZ2RemODj1eBL',
					'priority': 21
				}
			],
			'origin': origin,
			disabled: false
		};

		await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: targetActor.uuid, effects: [stuckEffectData]});
	}
}
else if (stuckEffect) {
	await MidiQOL.socket().executeAsGM("removeEffects", {actorUuid: targetActor.uuid, effects: [stuckEffect.id]});
}

