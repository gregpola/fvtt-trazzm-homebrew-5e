const version = "0.1.0";
const optionName = "Celestial Resilience";

try {
	if (args[0].macroPass === "postActiveEffects") {
		if(args[0].targets.length === 0) {
			ui.notifications.warn(`${optionName} No targets selected, only applying to the actor`);
		}
		
		let actor = await MidiQOL.MQfromActorUuid(args[0].actorUuid); // actor who cast the spell
		const targets = args[0].targets;

		// Build data
		const warlockLevel = actor.classes?.warlock?.data?.data?.levels ?? 0;
		const chrBonus = actor.data.data.abilities.cha.mod;
		
		// Self Heal
		let tempHP = warlockLevel + chrBonus;		
		if(!actor.data.data.attributes.hp.temp || (actor.data.data.attributes.hp.temp < tempHP)) {
			await actor.update({ "data.data.attributes.hp.temp" : tempHP });
		}
		
		// heal targets -- max of 5
		tempHP = Math.ceil(warlockLevel/2) + chrBonus;
		let countHealed = Math.min(5, targets.length);
		for (let i = 0; i < countHealed; i++) { 
			const tactor = targets[i].actor;
			if(!tactor.data.data.attributes.hp.temp || (tactor.data.data.attributes.hp.temp < tempHP)) {
				await tactor.update({ "data.attributes.hp.temp" : tempHP });
			}
		}
		
		await ChatMessage.create({ content: `${actor.name} bolsters themself and ${countHealed} friends` });
	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}
