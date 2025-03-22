const version = "10.0.0";
const optionName = "Dark One's Blessing";

try {
	let tactor = args[0].actor;
	let Temp = tactor.system.attributes.hp.temp ?? 0;
	let level = foundry.utils.getProperty(args[0].rollData, "classes.warlock.levels");
	let newTemp = level + tactor.system.abilities.cha.mod;

	if(newTemp > Temp)
		game.actors.get(tactor._id).update({"system.attributes.hp.temp" : newTemp});
	
} catch (err)  {
    console.error(`${resourceName} ${version}`, err);
}
