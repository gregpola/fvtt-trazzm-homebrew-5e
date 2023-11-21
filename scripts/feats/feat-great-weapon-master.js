/*
	You've learned to put the weight of a weapon to your advantage, letting its momentum empower your strikes. You gain
	the following benefits:

	* On your turn, when you score a critical hit with a melee weapon or reduce a creature to 0 hit points with one, you
	  can make one melee weapon attack as a bonus action.

	* Before you make a melee attack with a heavy weapon that you are proficient with, you can choose to take a -5
	  penalty to the attack roll. If the attack hits, you add +10 to the attack's damage.
 */
const version = "11.2";
const optionName = "Great Weapon Master";

try {
	if (args[0].macroPass === "preAttackRoll") {
		// check for eligible attack
		// Must be a melee weapon attack
		if (!["mwak"].includes(workflow.item.system.actionType))
			return {}; // weapon attack
		
		// Must be a heavy weapon that the actor is proficient with
		if (!workflow.item.system.properties.hvy) {
			console.error(`${optionName}: ${workflow.item.name} is not a heavy weapon`);
			return {};
		}
		if (!workflow.item.system.prof.hasProficiency) {
			console.error(`${optionName}: ${actor.name} is not proficient with ${workflow.item.name}`);
			return {};
		}

		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `${optionName}`,
				content: `<p>Do you want to apply ${optionName} to your attack?</p><p></p>(-5 to hit, +10 to damage)</p>`,
				buttons: {
					one: {
						icon: '<p> </p><img src = "icons/weapons/axes/axe-battle-skull-black.webp" width="30" height="30"></>',
						label: "<p>Yes</p>",
						callback: () => resolve(true)
					},
					two: {
						icon: '<p> </p><img src = "icons/skills/melee/weapons-crossed-swords-yellow.webp" width="30" height="30"></>',
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
				"name": `${optionName} (active)`,
				"icon": "icons/weapons/axes/axe-battle-skull-black.webp",
                "changes":[
                    { "key": "system.bonuses.mwak.attack", "mode": CONST.ACTIVE_EFFECT_MODES.ADD, "value": "-5", "priority": "20" },
                    { "key": "system.bonuses.mwak.damage", "mode": CONST.ACTIVE_EFFECT_MODES.ADD, "value": "+10", "priority": "21" }                
                ],
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
