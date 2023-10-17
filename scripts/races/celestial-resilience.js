const version = "10.0.0";
const optionName = "Celestial Resilience";

try {
	const lastArg = args[args.length - 1];
	let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	
	if (args[0].macroPass === "postActiveEffects") {
		const targets = lastArg.targets;

		// Build data
		const warlockLevel = actor.classes.warlock?.system.levels ?? 0;
		const chrBonus = actor.system.abilities.cha.mod;

		// Self Heal
		let tempHP = warlockLevel + chrBonus;		
		if(!actor.system.attributes.hp.temp || (actor.system.attributes.hp.temp < tempHP)) {
			await actor.update({ "system.attributes.hp.temp" : tempHP });
		}
		
		// heal targets -- max of 5
		tempHP = Math.ceil(warlockLevel/2) + chrBonus;
		let countHealed = Math.min(5, targets.length);
		for (let i = 0; i < countHealed; i++) { 
			const tactor = targets[i].actor;
			if(!tactor.system.attributes.hp.temp || (tactor.system.attributes.hp.temp < tempHP)) {
				await tactor.update({ "system.attributes.hp.temp" : tempHP });
			}
		}
		
		await ChatMessage.create({ content: `${actor.name} bolsters themself and ${countHealed} friends` });
	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}
