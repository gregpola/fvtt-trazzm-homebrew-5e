const version = "0.1.0";
try {
	// verify needed data
	if (!game.combat || !actor) {
		console.error("Missing data for Insightful Fighting");
		return;
	}
	
	let rogue = canvas.tokens.get(args[0].tokenId);
	let target = Array.from(game.user.targets)[0];
	
	let rogueRoll = await rogue.actor.rollSkill("ins");
	let tokenRoll = await target.actor.rollSkill("dec");
	if (rogueRoll.total >= tokenRoll.total) {
		ChatMessage.create({'content': `${rogue.name} gains insight over ${target.name}`});
	}
	else {
		ChatMessage.create({'content': `${rogue.name} fails to decipher ${target.name}'s tactics`});
	}

} catch (err) {
    console.error(`Insightful Fighting ${version}`, err);
}
