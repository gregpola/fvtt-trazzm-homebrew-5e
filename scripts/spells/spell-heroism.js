const version = "10.0.0";
const optionName = "Heroism";

try {
	//DAE Macro Execute, Effect Value = "Macro Name" t @damage (apply @mod damge of none type)
	const lastArg = args[args.length - 1];
	let tactor;
	if (lastArg.tokenId) tactor = canvas.tokens.get(lastArg.tokenId).actor;
	else tactor = game.actors.get(lastArg.actorId);
	const target = canvas.tokens.get(lastArg.tokenId)

	let mod = args[1];

	if (args[0] === "on") {
		ChatMessage.create({ content: `${optionName} is applied to ${tactor.name}` })
	}

	else if (args[0] === "off") {
		ChatMessage.create({ content: `${optionName} ends` });
	}

	else if(args[0] === "each"){
		let bonus = mod > tactor.system.attributes.hp.temp ? mod : tactor.system.attributes.hp.temp
			tactor.update({ "data.attributes.hp.temp": mod });
			ChatMessage.create({ content: `${optionName} continues on ${tactor.name}` })
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
