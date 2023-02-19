// When Deleted
let touchedTokens = template.flags.world?.spell?.web?.touchedTokens;
for (let i = 0; touchedTokens.length > i; i++) {
	let tokenDoc = canvas.scene.tokens.get(touchedTokens[i]);
	if (!tokenDoc) continue;
	await tokenDoc.unsetFlag('world', 'spell.web.' + template.id);
}
if (touchedTokens) await HomebrewMacros.webSpellEffects(touchedTokens);

// When entered
let touchedTokens = template.flags.world?.spell?.web?.touchedTokens || [];
if (!touchedTokens.includes(token.id)) {
	touchedTokens.push(token.id);
	await template.setFlag('world', 'spell.web', {touchedTokens});
}
await HomebrewMacros.webSpellEffects([token.id]);

// when left
let touchedTokens = template.flags.world?.spell?.web?.touchedTokens || [];
if (touchedTokens.includes(token.id)) {
	const index = touchedTokens.indexOf(token.id);
	const x = touchedTokens.splice(index, 1);
	await template.setFlag('world', 'spell.web', {touchedTokens});
}
await HomebrewMacros.webSpellEffects([token.id]);
