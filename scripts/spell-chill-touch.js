const version = "0.1.0";
const optionName = "Chill Touch";

//##############################################
// Midi-Qol On Use
// Detects Undead and gives them disadvantage
//##############################################
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

/*
		if (lastArg.hitTargets.length === 0) return {};
		const target = canvas.tokens.get(lastArg.hitTargets[0].id);
		const creatureTypes = ["undead"];
		const undead = creatureTypes.some(i => (target.actor.data.data.details?.type?.value || target.actor.data.data.details?.race).toLowerCase().includes(i));
		const itemD = lastArg.item;
		const spellSeconds = itemD.data.duration.value * 6;
		const gameRound = game.combat ? game.combat.round : 0;
		const effectName = `${itemD.name} Effect`;
		let undeadDis = [{ "key": "data.traits.di.value", "mode": CONST.ACTIVE_EFFECT_MODES.CUSTOM, "value": "healing", "priority": 20 }];
		if (undead) {
			undeadDis.push({ "key": "flags.midi-qol.disadvantage.attack.all", "mode": CONST.ACTIVE_EFFECT_MODES.CUSTOM, "value": 1, "priority": 20 });
		let effectData = {
			label: effectName,
			icon: "systems/dnd5e/icons/skills/ice_17.jpg",
			origin: lastArg.uuid,
			disabled: false,
			flags: { dae: { itemData: itemD } },
			duration: { rounds: itemD.data.duration.value, seconds: spellSeconds, startRound: gameRound, startTime: game.time.worldTime },
			changes: undeadDis
		};
		let checkEffect = target.actor.effects.find(i => i.data.label === effectName);
		if (checkEffect) return {};
		await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.actor.uuid, effects: [effectData] });
		
*/