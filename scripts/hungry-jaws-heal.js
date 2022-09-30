const version = "0.1.0";
const optionName = "Hungry Jaws";

try {
	if (args[0].macroPass === "postActiveEffects") {
		const actor = args[0].actor;
		
		// Self Heal
		const tempHP = actor.data.attributes.prof;
		if(!actor.data.attributes.hp.temp || (actor.data.attributes.hp.temp < tempHP)) {
			await actor.update({ "data.attributes.hp.temp" : tempHP });
			await ChatMessage.create({ content: `${actor.name} feeds on the flesh of their enemy` });
		}
	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}
