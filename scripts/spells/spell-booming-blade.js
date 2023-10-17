/*
	You brandish the weapon used in the spell’s casting and make a melee attack with it against one creature within 5 feet of you. On a hit, the target suffers the weapon attack’s normal effects and then becomes sheathed in booming energy until the start of your next turn. If the target willingly moves 5 feet or more before then, the target takes 1d8 thunder damage, and the spell ends.

	This spell’s damage increases when you reach certain levels. At 5th level, the melee attack deals an extra 1d8 thunder damage to the target on a hit, and the damage the target takes for moving increases to 2d8. Both damage rolls increase by 1d8 at 11th level (2d8 and 3d8) and again at 17th level (3d8 and 4d8).
*/
const version = "10.0.0";
const optionName = "Booming Blade";
const gameRound = game.combat ? game.combat.round : 0;
const sequencerFile = "jb2a.static_electricity.01.blue";
const sequencerScale = 1.5;
const damageType = "thunder";
const flagItemId = "midi-qol.BoomingBlade.uuid";
const flagItemDice = "midi-qol.BoomingBlade.dice";

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);

	if (args[0].macroPass === "DamageBonus") {
		// Must be a melee weapon attack
		if (!["mwak"].includes(args[0].itemData.system.actionType))
			return {}; // weapon attack
		
		// apply effect to the target to handle the move case
		const targetToken = game.canvas.tokens.get(lastArg.targets[0].id);
		sequencerEffect(targetToken, sequencerFile, sequencerScale);
		
		const sourceItem = await fromUuid(lastArg.sourceItemUuid);
		const characterLevel = actor.type === "character" ? actor.system.details.level : actor.system.details.cr;
		const cantripDice = 1 + Math.floor((characterLevel + 1) / 6);

		const effectData = {
			label: sourceItem.name,
			icon: sourceItem.img,
			origin: lastArg.sourceItemUuid,
			changes: [
				{
					key: 'macro.itemMacro',
					mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
					value: `ItemMacro.${sourceItem.name}`,
					priority: 20
				},
				{
					'key': 'macro.tokenMagic',
					'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
					'value': 'electric',
					'priority': 20
				}
			],
			flags: {
				dae: {
					selfTarget: false,
					stackable: "none",
					durationExpression: "",
					macroRepeat: "none",
					specialDuration: [
						"turnStartSource",
						"isMoved"
					],
					transfer: false
				},
				cantripDice: cantripDice
			},
			disabled: false
		};
		await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetToken.actor.uuid, effects: [effectData] });
		
		// add damage bonus to the attack
		const originalDice = cantripDice - 1;
		if (originalDice > 0) {
			let damageRoll0riginal = await new game.dnd5e.dice.DamageRoll(`${originalDice}d8[${damageType}]`, actor.getRollData(), { critical: lastArg.isCritical });
			await game.dice3d?.showForRoll(damageRoll0riginal);
			return {damageRoll: damageRoll0riginal.formula, flavor: `${optionName}`};
		}		
	}
	else if (lastArg["expiry-reason"]?.includes("midi-qol:isMoved")) {
		// apply damage and remove effect
		const actorToken = canvas.tokens.get(lastArg.tokenId);
		const sourceItem = await fromUuid(lastArg.efData.origin);
		const caster = sourceItem.parent;
		const casterToken = canvas.tokens.placeables.find((t) => t.actor?.uuid === caster.uuid);
		
		const damageRoll = await new Roll(`${lastArg.efData.flags.cantripDice}d8[${damageType}]`).evaluate({ async: false });
		await new MidiQOL.DamageOnlyWorkflow(caster, casterToken.document, damageRoll.total, damageType, [actorToken], 
			damageRoll, {flavor: `${optionName}`, itemCardId: lastArg.itemCardId});
		sequencerEffect(actorToken, sequencerFile, sequencerScale);
	}
	else if (args[0] === "off") {
		console.log(`${optionName} - off`);
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

// sequencer caller for effects on target
function sequencerEffect(target, file, scale) {
 if (game.modules.get("sequencer")?.active && hasProperty(Sequencer.Database.entries, "jb2a")) {
  new Sequence().effect().file(file).atLocation(target).scaleToObject(scale).play();
 }
}
