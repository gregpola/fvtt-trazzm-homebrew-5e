const version = "10.0.0";
const optionName = "Wall of Sand";

/*
	When Deleted
*/
let touchedTokens = template.flags.world?.spell?.WallofSand?.touchedTokens;
if (touchedTokens) {
	for (let i = 0; touchedTokens.length > i; i++) {
		let tokenDoc = canvas.scene.tokens.get(touchedTokens[i]);
		if (!tokenDoc) continue;
		await game.dfreds?.effectInterface.removeEffect(
			{ effectName: 'Blinded', uuid: tokenDoc.actor.uuid, origin: template.id });
	}
}

/*
	When Entered
*/
let touchedTokens = template.flags.world?.spell?.WallofSand?.touchedTokens || [];
if (!touchedTokens.includes(token.id)) {
	touchedTokens.push(token.id);
}
await template.setFlag('world', 'spell.WallofSand', {touchedTokens});
await game.dfreds?.effectInterface.addEffect(
	{ effectName: 'Blinded', uuid: token.actor.uuid, origin: template.id });

/*
	When Left
*/
let touchedTokens = template.flags.world?.spell?.WallofSand?.touchedTokens || [];
const index = touchedTokens.indexOf(token.id);
if (index > -1) {
	touchedTokens.splice(index, 1);
	await template.setFlag('world', 'spell.WallofSand', {touchedTokens});
}

await game.dfreds?.effectInterface.removeEffect(
	{ effectName: 'Blinded', uuid: token.actor.uuid, origin: template.id });
