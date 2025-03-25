/*
	Melee Weapon Attack: +9 to hit, reach 15 ft., one creature. Hit: 3 (1d6) bludgeoning damage. If the target is hit three times by the rod on one turn, the target must succeed on a DC 15 Constitution saving throw or suffer the following effects for 1 minute: the target’s speed is halved, it has disadvantage on Dexterity saving throws, and it can’t use reactions. Moreover, on each of its turns, it can take either an action or a bonus action, but not both. At the end of each of its turns, it can repeat the saving throw, ending the effect on itself on a success.
*/
const version = "10.0.1s";
const optionName = "Tentacle Rod";
const flagName = "tentacle-rod-hits";
const combatTime = game.combat ? `${game.combat.id}-${game.combat.round + game.combat.turn / 100}` : 1;
const saveFlavor = `${CONFIG.DND5E.abilities["con"].label} DC15 ${optionName}`;

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const targetToken = game.canvas.tokens.get(lastArg.hitTargets[0].id);

	if (args[0].macroPass === "postActiveEffects") {
		const flags = actor.getFlag("midi-qol", flagName);
		
		// check for reset condition
		if (!flags || (flags.time !== combatTime)) {
			await actor.setFlag("midi-qol", flagName, {count: 1, time: combatTime});
		}
		else if (flags.count === 2) {
			// third hit
			let saveRoll = await targetToken.actor.rollAbilitySave("con", {flavor: saveFlavor, damageType: "magic"});
			await game.dice3d?.showForRoll(saveRoll);
			
			if (saveRoll.total < 15) {
				await anime(targetToken);
				await wait(500);
				
				// apply negative effects
				const effectData = {
					label: "Slowed by Tentacle Rod",
					icon: "icons/creatures/webs/web-thin-pruple.webp",
					origin: lastArg.uuid,
					changes: [
						{
							key: 'flags.midi-qol.OverTime',
							mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
							value: "turn=end, label=Slowed by Tentacle Rod, saveDC=15,saveAbility=con,saveRemove=true",
							priority: 20
						},
						{ key: "system.attributes.movement.all", mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: '/2', priority: 21 },
						{ key: "flags.midi-qol.disadvantage.ability.save.dex", mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: "1", priority: 22 }
					],
					duration: { seconds: 60, startTime: game.time.worldTime },
					disabled: false
				};
				await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetToken.actor.uuid, effects: [effectData] });
			}
			else {
				// reset the counter
				await actor.unsetFlag("midi-qol", flagName);
			}
		}
		else {
			// increment the hits counter
			const newHits = flags.count + 1;
			await actor.setFlag("midi-qol", flagName, {count: newHits, time: combatTime});
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function anime(token) {
	new Sequence()
		.effect()
		.file("jb2a.club.01.purple")
		.atLocation(token)
		.fadeOut(500)
		.wait(500)
		.play();
}
