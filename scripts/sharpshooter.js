const version = "10.0.0";
const optionName = "Sharpshooter";
const lastArg = args[args.length - 1];

try {
	let workflow = await MidiQOL.Workflow.getWorkflow(lastArg.uuid);

	if (args[0].macroPass === "preAttackRoll") {
		let tactor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		
		// check for eligible attack
		// Must be a melee weapon attack
		if (!["rwak"].includes(args[0].itemData.system.actionType))
			return {}; // weapon attack
		
		// Must be a heavy weapon that the actor is proficient with
		if (!lastArg.itemData.system.proficient)
			return {};

		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				// localize this text
				title: `${optionName}`,
				content: `<p>Do you want to apply ${optionName} to your attack?</p>`,
				buttons: {
					one: {
						icon: '<p> </p><img src = "icons/skills/ranged/target-bullseye-arrow-blue.webp" width="30" height="30"></>',
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
                "changes":[
                    { "key": "system.bonuses.rwak.attack", "mode": CONST.ACTIVE_EFFECT_MODES.ADD, "value": "-5", "priority": "20" },
                    { "key": "system.bonuses.rwak.damage", "mode": CONST.ACTIVE_EFFECT_MODES.ADD, "value": "+10", "priority": "21" }                
                ],
                "duration": {
                    "startTime": game.time.worldTime,
                },
                "icon": "icons/skills/ranged/target-bullseye-arrow-blue.webp",
                "label": `${optionName}`,
                "flags": {
                    "dae": { "specialDuration": [ "1Attack" ] }
				}
			};
			
			await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tactor.uuid, effects: [effectData] });
		}
	}
	
} catch (err) {
    console.error(`${optionName}:  ${version}`, err);
}
