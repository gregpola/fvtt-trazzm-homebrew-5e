const version = "0.2.0";
const optionName = "Chill Touch";

//#############################################################################
// Midi-Qol On Use
//
// Detects Undead and gives them disadvantage
// Also disallows healing until the start of the source actor's next turn
//#############################################################################
const creatureTypes = ["undead"];

try {
	if (args[0].hitTargets.length <1) return {};

	const duration = game.combat ? {combat:game.combat.uuid, rounds:1, turns:0, startRound: game.combat.round, startTurn: game.combat.turn, startTime: game.time.worldTime} : {seconds:6, startTime:game.time.worldTime};

	if (args[0].item.name==="Chill Touch") {
		const targetActor = args[0].hitTargets[0].actor;
		const sourceOrigin = args[0].tokenUuid;
		const undead = creatureTypes.some(i => (targetActor.data.data.details?.type?.value || targetActor.data.data.details?.race).toLowerCase().includes(i));

		if (undead) {
			console.log("target is undead")
			const effUndead = {
					changes:[{
						key: 'flags.midi-qol.onUseMacroName',
						mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
						value: `ItemMacro.${args[0].itemUuid},preAttackRoll`,
					}],
					origin: sourceOrigin,
					duration: duration,
					label: "Disadvantage against caster",
					icon: args[0].item.img,
					transfer: false,
					flags: { dae: { specialDuration: ['turnStartSource'] } }
			}
			
			const hasUndeadEffect = findEffect(targetActor, "Disadvantage against caster", sourceOrigin);
			if (hasUndeadEffect) {
				await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: args[0].targetUuids[0], effects: [hasUndeadEffect.id] });
			}
			await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].targetUuids[0], effects: [effUndead] });
		}
		
		const effNoHealing = {
			changes:[{
				key: 'data.traits.di.value',
				mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
				value: "healing"
			}],
			origin: sourceOrigin,
			label: "No Healing",
			duration:duration,
			icon: args[0].item.img,
			tranfer:false,
			flags: { dae: { specialDuration: ['turnStartSource'] } }
		}
		
		const hasNoHealingEffect = findEffect(targetActor, "No Healing", sourceOrigin);
		if (hasNoHealingEffect) {
			await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: args[0].targetUuids[0], effects: [hasNoHealingEffect.id] });
		}
		await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].targetUuids[0], effects: [effNoHealing] });
	}

	if (args[0].hitTargetUuids[0] === args[0].actor.effects.find(eff=>eff.data.label === "Disadvantage against caster")?.data.origin) 
		setProperty(args[0].workflowOptions, "disadvantage", true);
	
} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}

async function findEffect(actor, effectName, origin) {
    let effectUuid = null;
    effectUuid = actor?.data.effects.find(ef => ef.data.label === effectName && ef.data.origin === origin);
    return effectUuid;
}

/*
const lastArg = args[args.length - 1];
let targetActor;
const creatureTypes = ["undead"];

try {
	if(args[0]==="on") {
	}	
	
	else if (args[0].macroPass === "preAttackRoll") { //caster Attacking
		targetActor = (await fromUuid(lastArg.hitTargetUuids[0]))?.actor;
		if (targetActor?.data?.flags?.dae?.onUpdateTarget && lastArg.targets.length > 0) {
			const isMarked = targetActor.data.flags.dae.onUpdateTarget.find(flag => flag.flagName === "Chill Touch" && flag.sourceTokenUuid === lastArg.tokenUuid);
			const undead = creatureTypes.some(i => (targetActor.data.data.details?.type?.value || targetActor.data.data.details?.race).toLowerCase().includes(i));
			
			if (isMarked) {
				const effectData = {
					"changes":[
						{ "key": "flags.midi-qol.disadvantage.attack.all", "mode": CONST.ACTIVE_EFFECT_MODES.CUSTOM, "value": 1, "priority": "20" }
					],
					"duration": {
						"startTime": game.time.worldTime,
					},
					"icon": "icons/magic/unholy/hand-claw-fire-blue.webp",
					"label": "Chilled Attack",
					"flags": {
						"core": { "statusId": "Chill Touch - Disadvantage Attack" },
						"dae": { "specialDuration": [ "1Attack" ] }
				}
			}
			await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetActor.uuid, effects: [effectData] });
			}
		}
		return;
	}
	
	
} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}

async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
*/