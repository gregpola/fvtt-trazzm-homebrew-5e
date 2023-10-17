/*
	You have mastered ranged weapons and can make shots that others find impossible. You gain the following benefits:

		* Attacking at long range doesn't impose disadvantage on your ranged weapon attack rolls.
		* Your ranged weapon attacks ignore half cover and three-quarters cover.
		* Before you make an attack with a ranged weapon that you are proficient with, you can choose to take a -5
		  penalty to the attack roll. If the attack hits, you add +10 to the attack's damage.
 */
const version = "11.0";
const optionName = "Sharpshooter";

try {
	if (args[0].macroPass === "preAttackRoll") {
		// check for eligible attack
		// Must be a melee weapon attack
		if (!["rwak"].includes(workflow.item.system.actionType))
			return {}; // weapon attack

		// Must be a weapon that the actor is proficient with
		if (!workflow.item.system.prof.hasProficiency) {
			console.error(`${optionName}: ${actor.name} is not proficient with ${workflow.item.name}`);
			return {};
		}

		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `${optionName}`,
				content: `<p>Do you want to apply ${optionName} to your attack?</p>`,
				buttons: {
					one: {
						icon: '<p> </p><img src = "icons/skills/ranged/target-bullseye-arrow-blue.webp" width="50" height="50"></>',
						label: "<p>Yes (-5 to hit, +10 to damage)</p>",
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

		let useFeature = await dialog;
		if (useFeature) {
			// add the attack penalty and damage bonus to the actor
            const effectData = {
                "changes":[
                    { "key": "system.bonuses.rwak.attack", "mode": CONST.ACTIVE_EFFECT_MODES.ADD, "value": "-5", "priority": "20" },
                    { "key": "system.bonuses.rwak.damage", "mode": CONST.ACTIVE_EFFECT_MODES.ADD, "value": "10", "priority": "21" }
                ],
                "duration": {
                    "startTime": game.time.worldTime,
                },
                "icon": "icons/skills/ranged/target-bullseye-arrow-blue.webp",
                "name": `${optionName}`,
                "flags": {
                    "dae": { "specialDuration": [ "1Attack" ] }
				}
			};
			
			await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effectData] });
		}
	}
	
} catch (err) {
    console.error(`${optionName}:  ${version}`, err);
}
