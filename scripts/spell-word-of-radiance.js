const version = "0.1.0";
const optionName = "Word of Radiance";

try {
	let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
	let actor = workflow?.actor;
		
	if (args[0].macroPass === "templatePlaced") {
		// find nearby enemies
		const enemies = MidiQOL.findNearby(-1, token, 10, 0);

		const dc = 8 + actor.data.data.attributes.prof + actor.data.data.abilities.cha.mod;
		const flavor = `${CONFIG.DND5E.abilities["cha"]} DC${dc} ${optionName}`;
		
		for (let ttoken of enemies) {
			let saveRoll = (await ttoken.actor.rollAbilitySave("cha", {flavor})).total;
			if (saveRoll < dc) {
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
		const lastTime = actor.getFlag("midi-qol", "necroticShroudTime");
		if (combatTime !== lastTime) {
			await actor.setFlag("midi-qol", "necroticShroudTime", combatTime)
		}

		const pb = actor?.data?.data?.attributes?.prof ?? 2;
		return {damageRoll: `${pb}[necrotic]`, flavor: `${optionName} Damage`};		
	}

} catch (err) {
    console.error(`${resourceName}: ${optionName} - ${version}`, err);
}

// Check to make sure the actor hasn't already applied the damage this turn
function isAvailableThisTurn() {
	if (game.combat) {
	  const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
	  const lastTime = actor.getFlag("midi-qol", "necroticShroudTime");
	  if (combatTime === lastTime) {
	   console.log(`${optionName}: Already used this turn`);
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
