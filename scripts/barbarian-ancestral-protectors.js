/*
	Starting when you choose this path at 3rd level, spectral warriors appear when you enter your rage. While you’re raging, the first creature you hit with an attack on your turn becomes the target of the warriors, which hinder its attacks. Until the start of your next turn, that target has disadvantage on any attack roll that isn’t against you, and when the target hits a creature other than you with an attack, that creature has resistance to the damage dealt by the attack. The effect on the target ends early if your rage ends.
*/
const version = "11.0";
const optionName = "Ancestral Protectors";
const rageEffectName = "Rage";
const timeFlag = "ancestralProtectorsTime";

try {
	const lastArg = args[args.length - 1];
	
	// use damage bonus to make sure the actor hit
	if (args[0].macroPass === "DamageBonus") {
		let target = lastArg.hitTargets[0];
		
		// make sure the actor is raging
		if (!hasEffectApplied(rageEffectName, actor)) {
			console.log(`${optionName}: not raging`);
			return {};
		}

		// make sure it's an attack
		if (!["mwak", "rwak", "msak", "rsak"].includes(workflow.item.system.actionType)) {
			console.log(`${optionName}: not an eligible attack`);
			return {};
		}
		
		// Check for availability i.e. first hit on the actors turn
		if (!isAvailableThisTurn() || !game.combat) {
			console.log(`${optionName} - not available this attack`);
			return;
		}
		
		// set the time flag
		const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
		const lastTime = actor.getFlag("midi-qol", timeFlag);
		if (combatTime !== lastTime) {
			await actor.setFlag("midi-qol", timeFlag, combatTime)
		}		

		// flag the target
		await markAsTarget(target.actor, actor.uuid, lastArg);
		
	}
	else if (args[0].tag === "OnUse" && args[0].macroPass === "postAttackRoll") {
		let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		
		if (actor.getFlag("world", "ancestralProtectors.sourceTokenUuid")) {
			// Damage was done by the marked target
			await handlePreDamageByMarkedTarget(lastArg);
		}
	}

} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}

/**
 * Returns true if the specified effect name is found on the actor.
 * @param {*} effectName name of the effect to find.
 * @param {*} actor actor on which to look for the effect.
 * @returns true if the effect is found, false otherwise.
 */
function hasEffectApplied(effectName, actor) {
  return actor.effects.find((ae) => ae.name === effectName) !== undefined;
}

// Mark the target 
async function markAsTarget(targetActor, actorId, macroData) {
	const effectData = {
		name: optionName,
		icon: "icons/environment/people/charge.webp",
		origin: actorId,
		changes: [
			{
				key: 'flags.midi-qol.disadvantage.attack.all',
				mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
				value: `'@targetUuid' !== '${macroData.tokenUuid}'`,
				priority: 20
			},
			// macro to set damage resistance or not
			{
				key: "flags.midi-qol.onUseMacroName",
				mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
				value: `ItemMacro.${macroData.sourceItemUuid},postAttackRoll`,
				priority: 20,
			},
			// flag to indicate who marked this actor
			{
				key: "flags.world.ancestralProtectors.sourceTokenUuid",
				mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
				value: macroData.tokenUuid,
				priority: 20,
			},
		],
		flags: {
			dae: {
				selfTarget: false,
				stackable: "none",
				durationExpression: "",
				macroRepeat: "none",
				specialDuration: [
					"turnStartSource"
				],
				transfer: false
			}
		},
		disabled: false
	};
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetActor.uuid, effects: [effectData] });
}

/**
 * When a marked target deals damage. Adds damage resistance to the target if the damage was caused by an attack and the target is not the marker.
 * @param {*} macroData midi-qol macro data.
 */
async function handlePreDamageByMarkedTarget(macroData) {
	if (macroData.hitTargets.length < 1 || !macroData.attackRoll) return;
	// There must be at least one hit target
	// The damage must be from an attack
	let token = canvas.tokens.get(args[0].tokenId);
	let actor = token.actor;
	
	const sourceTokenUuid = actor.getFlag("world", "ancestralProtectors.sourceTokenUuid");	
	const notSourceTargetUuids = macroData.targetUuids.filter((targetUuid) => targetUuid !== sourceTokenUuid);
	if (notSourceTargetUuids.length > 0) {
		console.log(`${optionName} - damage resistance should apply`);

		// create an active effect on targets to provide DR on the attack
		const sourceItem = await fromUuid(macroData.sourceItemUuid);
		const targetEffectData = {
			changes: [
				{
					key: "system.traits.dr.all",
					mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
					value: "1",
					priority: 20,
				},
			],
			flags: {
				dae: {
					selfTarget: false,
					stackable: "none",
					durationExpression: "",
					macroRepeat: "none",
					specialDuration: [
						"isDamaged"
					],
					transfer: false
				}
			},
			origin: macroData.sourceItemUuid, //flag the effect as associated to the source item used
			disabled: false,
			duration: { turns: 1 },
			icon: sourceItem.img,
			name: `${sourceItem.name} - Damage resistance`,
		};

		for (let targetUuid of notSourceTargetUuids) {
			const target = await fromUuid(targetUuid);
			const targetActor = target.actor;
			await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetActor.uuid, effects: [targetEffectData] });
		}
	}
}

// Check to make sure the actor hasn't already applied Ancestral Protectors
function isAvailableThisTurn() {
	if (game.combat) {
		const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
		const lastTime = actor.getFlag("midi-qol", timeFlag);
		if (combatTime === lastTime) {
			console.log(`${optionName} - already applied this turn`);
			return false;
		}
		
		return true;
	}
	
	return false;
}
