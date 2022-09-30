const version = "0.1.0";

try {
	const theTarget = args[0].targets[0];
	if (!theTarget) return false;
	
	let bonus;
	if (theTarget.actor.type === "character") {
	  bonus = theTarget.actor.data.data.details.level;
	} else {
	  bonus = theTarget.actor.data.data.details.cr;
	}
	console.log("Healer: " + bonus);
	
	let healRoll = await new Roll(`1d6 + 4 + ${bonus}`).roll();	
	//await theTarget.actor.applyDamage(-(healRoll.total + 4 + bonus));
	const totalHealed = healRoll.total + 4 + bonus;
	let healedTargets = new Set();
	healedTargets.add(theTarget);
	await new MidiQOL.DamageOnlyWorkflow(actor, token, totalHealed, "healing", [...healedTargets], healRoll, {flavor: "Healing feat", itemCardId: args[0].itemCardId});

	
} catch (err) {
    console.error(`Healer feat ${version}`, err);
}
