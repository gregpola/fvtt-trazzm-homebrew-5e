/*
	As an action, you can magically share the darkvision of this feature with willing creatures you can see within 10 feet of you, up to a number of creatures equal to your Wisdom modifier (minimum of one creature). The shared darkvision lasts for 1 hour. Once you share it, you can’t do so again until you finish a long rest, unless you expend a spell slot of any level to share it again.
*/
const version = "10.0.0";
const optionName = "Eyes of Night";

const effectData = {
	label: optionName,
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
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);
			
	if (args[0].macroPass === "postActiveEffects") {
		const maxTargets = Math.max(1, actor.system.abilities.wis.mod);
		
		for (let i=0; i < maxTargets && i < lastArg.targets.length; i++) {
			let target = lastArg.targets[i];
			await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.actor.uuid, effects: [effectData] });
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
