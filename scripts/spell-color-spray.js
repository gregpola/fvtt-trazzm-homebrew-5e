/*
	A dazzling array of flashing, colored light springs from your hand. Roll 6d10; the total is how many hit points of creatures this spell can affect. Creatures in a 15-foot cone originating from you are affected in ascending order of their current hit points (ignoring Unconscious creatures and creatures that can't see).

	Starting with the creature that has the lowest current hit points, each creature affected by this spell is Blinded until the end of your next turn. Subtract each creature's hit points from the total before moving on to the creature with the next lowest hit points. A creature's hit points must be equal to or less than the remaining total for that creature to be affected.

	At Higher Levels. When you cast this spell using a spell slot of 2nd level or higher, roll an additional 2d10 for each slot level above 1st.
*/
const version = "10.0.0";
const optionName = "Color Spray";
const gameRound = game.combat ? game.combat.round : 0;

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);

	if (args[0].macroPass === "postActiveEffects") {
		const level = Number(lastArg.spellLevel);
		let targets = lastArg.targets;
		let totalHitPoints = lastArg.damageTotal;
		
		// sort the targets by current hp
		targets.sort((a, b)=> {	return a.actor.system.attributes.hp.value < b.actor.system.attributes.hp.value ? -1 : 1	});
		
		// apply unconscious
		let duration = 60;
		let d = lastArg.itemData.system.duration;
		if (d.units === "second") {
			duration = d.value;
		}
		else if (d.units === "minute") {
			duration = d.value * 60;
		}
		else if (d.units === "hour") {
			duration = d.value * 3600;
		}		
		
		for (let t of targets) {
			//t.sight.visionMode
			const hasEffectApplied = await game.dfreds.effectInterface.hasEffectApplied('Blinded', t.actor.uuid);
			if (!hasEffectApplied) {
				let hp = t.actor.system.attributes.hp.value;
				
				if (hp <= totalHitPoints) {
					totalHitPoints -= hp;
					markAsBlinded(lastArg.uuid, t.actor.uuid);
					warpgate.wait(500);
				}
				else {
					console.log(`${optionName} - ran out of affected hit points`);
					break;
				}
			}
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function markAsBlinded(sourceOrigin, targetId) {
	const effectData = {
		label: "Blinded",
		icon: "icons/magic/light/projectile-needles-salvo-yellow.webp",
		origin: sourceOrigin,
		changes: [
			{
				key: 'macro.CE',
				mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
				value: "Blinded",
				priority: 20
			}
		],
		duration: { rounds: 1, turns: 2, startRound: gameRound, startTime: game.time.worldTime },
		flags: { 
			"dae": { 
				"token": targetId, 
				specialDuration: ["turnEndSource"] } 
		},
		disabled: false
	};
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetId, effects: [effectData] });
}