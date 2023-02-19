// When Deleted
let touchedTokens = template.flags.world?.spell?.evardsblacktentacles?.touchedTokens;
for (let i = 0; touchedTokens.length > i; i++) {
	let tokenDoc = canvas.scene.tokens.get(touchedTokens[i]);
	if (!tokenDoc) continue;
	await tokenDoc.unsetFlag('world', 'spell.evardsblacktentacles.' + template.id);
}
if (touchedTokens) await HomebrewMacros.evardsBlackTentaclesEffects(touchedTokens);

// When entered
let touchedTokens = template.flags.world?.spell?.evardsblacktentacles?.touchedTokens || [];
if (!touchedTokens.includes(token.id)) {
	touchedTokens.push(token.id);
	await template.setFlag('world', 'spell.evardsblacktentacles', {touchedTokens});
	await HomebrewMacros.evardsBlackTentaclesEffects([token.id]);
}

// when left
let touchedTokens = template.flags.world?.spell?.evardsblacktentacles?.touchedTokens || [];
if (touchedTokens.includes(token.id)) {
	const index = touchedTokens.indexOf(token.id);
	const x = touchedTokens.splice(index, 1);
	await template.setFlag('world', 'spell.evardsblacktentacles', {touchedTokens});
}
await HomebrewMacros.evardsBlackTentaclesEffects([token.id]);
