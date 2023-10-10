/*
	As an action, you can magically share the darkvision of this feature with willing creatures you can see within 10
	feet of you, up to a number of creatures equal to your Wisdom modifier (minimum of one creature). The shared
	darkvision lasts for 1 hour. Once you share it, you can’t do so again until you finish a long rest, unless you
	expend a spell slot of any level to share it again.
*/
const version = "11.0";
const optionName = "Eyes of Night";

const effectData = {
	name: optionName,
	icon: "icons/magic/perception/eye-slit-orange.webp",
	origin: null,
	changes: [
		{
			"key": "ATL.dimSight",
			"mode": 4,
			"value": "300",
			"priority": 20
		},
		{
			"key": "ATL.sight.visionMode",
			"mode": 4,
			"value": "darkvision",
			"priority": 20
		},
		{
			"key": "ATL.detectionModes.basic.range",
			"mode": 4,
			"value": "300",
			"priority": 20
		},
		{
			"key": "system.attributes.senses.darkvision",
			"mode": 4,
			"value": "300",
			"priority": 20
		}
	],
	duration: {
		"startTime": game.time.worldTime,
		"seconds": 3600,
		"combat": null,
		"rounds": null,
		"turns": null,
		"startRound": null,
		"startTurn": null
	},
	disabled: false
};
	
try {
	if (args[0].macroPass === "postActiveEffects") {
		const maxTargets = Math.max(1, actor.system.abilities.wis.mod);
		
		for (let i=0; i < maxTargets && i < workflow.targets.length; i++) {
			let target = workflow.targets[i];
			await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.actor.uuid, effects: [effectData] });
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
