/*
	You can throw yourself into a feeding frenzy. As a bonus action, you can make a special attack with your Bite. If the attack hits, it deals its normal damage, and you gain temporary hit points equal to your proficiency bonus. You can use this trait a number of times equal to your proficiency bonus, and you regain all expended uses when you finish a long rest.
*/
const version = "10.0.0";
const optionName = "Hungry Jaws";

try {
	if (args[0].macroPass === "postActiveEffects") {
		const lastArg = args[args.length - 1];
		let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		
		// Self Heal
		const tempHP = actor.system.attributes.prof;
		if(!actor.system.attributes.hp.temp || (actor.system.attributes.hp.temp < tempHP)) {
			await actor.update({ "system.attributes.hp.temp" : tempHP });
			await ChatMessage.create({ content: `${actor.name} feeds on the flesh of their enemy` });
		}
	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}
