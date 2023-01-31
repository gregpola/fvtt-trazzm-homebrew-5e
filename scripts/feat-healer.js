const version = "10.01.0";
const optionName = "Healer";
const lastArg = args[args.length - 1];

try {
	const theTarget = lastArg.targets[0];
	if (!theTarget) return false;
	
	let bonus;
	if (theTarget.actor.type === "character") {
	  bonus = theTarget.actor.system.details.level;
	} else {
	  bonus = theTarget.actor.system.details.cr;
	}
	console.log("Healer: " + bonus);
	
	let healRoll = await new Roll(`1d6 + 4 + ${bonus}`).roll();	
	const totalHealed = healRoll.total + 4 + bonus;
	let healedTargets = new Set();
	healedTargets.add(theTarget);
	await new MidiQOL.DamageOnlyWorkflow(actor, token, totalHealed, "healing", [...healedTargets], healRoll, {flavor: "Healing feat", itemCardId: lastArg.itemCardId});

	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
