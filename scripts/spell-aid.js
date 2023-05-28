/*
	Your spell bolsters your allies with toughness and resolve. Choose up to three creatures within range. Each target's
	hit point maximum and current hit points increase by 5 for the duration

	When you cast this spell using a spell slot of 3rd level or higher, a target's hit points increase by an additional
	5 for each slot level above 2nd.
*/
const version = "10.0";
const optionName = "Aid";

try {
	if (args[0] === "on") {
		const spellLevel = Number(args[1]);
		const hpIncrease = (spellLevel - 1) * 5;

		// apply hp max increase
		const newValue = actor.system.attributes.hp.value + hpIncrease;
		const newMax = actor.system.attributes.hp.max + hpIncrease;

		const updates = {
			actor: {
				"system.attributes.hp.max": newMax
			}
		}

		/* Mutate the actor */
		await warpgate.mutate(token, updates, {}, { name: optionName });

		// update their hp
		await actor.update({"system.attributes.hp.value" : newValue});
	}
	else if (args[0] === "off") {
		await warpgate.revert(token, optionName);
		if (actor.system.attributes.hp.value > actor.system.attributes.hp.max) {
			await actor.update({"system.attributes.hp.value" : actor.system.attributes.hp.max});
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
