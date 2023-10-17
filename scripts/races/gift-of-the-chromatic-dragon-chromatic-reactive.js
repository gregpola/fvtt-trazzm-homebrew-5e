/*
	When you take acid, cold, fire, lightning, or poison damage, you can use your reaction to give yourself resistance to that instance of damage. You can use this reaction a number of times equal to your proficiency bonus, and you regain all expended uses when you finish a long rest.
*/
const version = "10.0.0";
const optionName = "Gift of the Chromatic Dragon - Reactive Resistance";
//const elements = { acid: "acid", cold: "cold", fire: "fire", lightning: "lightning", poison: "poison" };

try {
	const lastArg = args[args.length - 1];
	let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);

	if (args[0].macroPass === "postActiveEffects") {
		let effectData = [{
			label: optionName,
			icon: "icons/creatures/reptiles/dragon-horned-blue.webp",
			changes: [
				{ key: `traits.dr.value`, mode: 2, value: "acid", priority: 20 },
				{ key: `traits.dr.value`, mode: 2, value: "cold", priority: 20 },
				{ key: `traits.dr.value`, mode: 2, value: "fire", priority: 20 },
				{ key: `traits.dr.value`, mode: 2, value: "lightning", priority: 20 },
				{ key: `traits.dr.value`, mode: 2, value: "poison", priority: 20 }
			],
			origin: lastArg.uuid,
			disabled: false,
			flags: { dae: { specialDuration: ["1Reaction"] } },
		}];
		
		await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effectData] });
	}
	
} catch (err) {
	console.error(`${optionName}: ${version}`, err);
	return false;
}

function capitalizeFirstLetter(str) {
	return str[0].toUpperCase() + str.slice(1);
}
