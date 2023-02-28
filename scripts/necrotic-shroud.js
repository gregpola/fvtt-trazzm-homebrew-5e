/*
	Your eyes briefly become pools of darkness, and ghostly, flightless wings sprout from your back temporarily. Creatures other than your allies within 10 feet of you that can see you must succeed on a Charisma saving throw (DC 8 + your proficiency bonus + your Charisma modifier) or become frightened of you until the end of your next turn. Until the transformation ends, once on each of your turns, you can deal extra necrotic damage to one target when you deal damage to it with an attack or a spell. The extra damage equals your proficiency bonus.
*/
const version = "10.0.1";
const optionName = "Necrotic Shroud";
const timeFlag = "necroticShroudTime";

const lastArg = args[args.length - 1];
const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);

try {
	if (args[0].macroPass === "preambleComplete") {
		// find nearby enemies
		const enemies = MidiQOL.findNearby(-1, token, 10);
		const dc = 8 + actor.system.attributes.prof + actor.system.abilities.cha.mod;
		const flavor = `${CONFIG.DND5E.abilities["cha"]} DC${dc} ${optionName}`;
		
		for (let ttoken of enemies) {
			let saveRoll = await ttoken.actor.rollAbilitySave("cha", {flavor: flavor, damageType: "frightened"});
			await game.dice3d?.showForRoll(saveRoll);
			if (saveRoll.total < dc) {
				await markAsFrightened(ttoken.actor.uuid, actor.uuid);
			}
		}
		
	}
	else if (args[0].macroPass === "DamageBonus") {
		// Check for availability i.e. once per actors turn
		if (!isAvailableThisTurn() || !game.combat) {
			console.log(`${optionName}: is not available for this damage`);
			return;
		}

		let useFeature = false;
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `${optionName}`,
				content: `<p>Apply ${optionName} damage to this attack?</p>`,
				buttons: {
					one: {
						icon: '<p> </p><img src = "icons/magic/unholy/silhouette-light-fire-blue.webp" width="50" height="50"></>',
						label: "<p>Yes</p>",
						callback: () => resolve(true)
					},
					two: {
						icon: '<p> </p><img src = "icons/skills/melee/weapons-crossed-swords-yellow.webp" width="50" height="50"></>',
						label: "<p>No</p>",
						callback: () => { resolve(false) }
					}
				},
				default: "two"
			}).render(true);
		});

		useFeature = await dialog;
		if (!useFeature) {
			console.log(`${optionName}: player chose to skip`);
			return;
		}

		const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
		const lastTime = actor.getFlag("midi-qol", timeFlag);
		if (combatTime !== lastTime) {
			await actor.setFlag("midi-qol", timeFlag, combatTime)
		}

		const pb = actor.system.attributes.prof;
		return {damageRoll: `${pb}[necrotic]`, flavor: `${optionName} Damage`};		
	}

} catch (err) {
    console.error(`${resourceName}: ${optionName} - ${version}`, err);
}

// Check to make sure the actor hasn't already applied the damage this turn
function isAvailableThisTurn() {
	if (game.combat) {
		const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
		const lastTime = actor.getFlag("midi-qol", timeFlag);
		if (combatTime === lastTime) {
			return false;
		}
		return true;
	}	
	return false;
}

async function markAsFrightened(targetId, actorId) {
	const effectData = {
		label: "Frightened",
		icon: "icons/magic/control/fear-fright-monster-green.webp",
		origin: actorId,
		changes: [
			{
				key: 'macro.CE',
				mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
				value: "Frightened",
				priority: 20
			}
		],
		flags: {
			dae: {
				selfTarget: false,
				stackable: "none",
				durationExpression: "",
				macroRepeat: "none",
				specialDuration: [
					"turnEndSource"
				],
				transfer: false
			}
		},
		disabled: false
	};
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetId, effects: [effectData] });
}