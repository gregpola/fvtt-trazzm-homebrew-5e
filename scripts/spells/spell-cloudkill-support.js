// When Deleted
let touchedTokens = template.flags.world?.spell?.cloudkill?.touchedTokens;
for (let i = 0; touchedTokens.length > i; i++) {
	let tokenDoc = canvas.scene.tokens.get(touchedTokens[i]);
	if (!tokenDoc) continue;
	await tokenDoc.unsetFlag('world', 'spell.cloudkill.' + template.id);
}
if (touchedTokens) await HomebrewMacros.cloudkillEffects(touchedTokens);

// When moved
let tokensInTemplate = await game.modules.get('templatemacro').api.findContained(template);
console.log(tokensInTemplate);
let touchedTokens = template.flags.world?.spell?.cloudkill?.touchedTokens || [];
for (let i = 0; tokensInTemplate.length > i; i++) {
	if (!touchedTokens.includes(tokensInTemplate[i])) touchedTokens.push(tokensInTemplate[i]);
}
await template.setFlag('world', 'spell.cloudkill', {touchedTokens});
await HomebrewMacros.cloudkillEffects(touchedTokens);

// When entered
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
await sleep(10);
await HomebrewMacros.cloudkillEffects([token.id]);
let touchedTokens = template.flags.world?.spell?.cloudkill?.touchedTokens || [];
if (!touchedTokens.includes(token.id)) touchedTokens.push(token.id);
await template.setFlag('world', 'spell.cloudkill', {touchedTokens});
let doDamage = false;
if (game.combat != null && game.combat != undefined) {
	let combatTurn = game.combat.round + '-' + game.combat.turn;
	let tokenTurn = token.document.getFlag('world', `spell.cloudkill.${template.id}.turn`);
	if (tokenTurn != combatTurn) doDamage = true;
	token.document.setFlag('world', `spell.cloudkill.${template.id}.turn`, combatTurn);
} else {
	doDamage = true;
}
if (doDamage) {
	let effect = token.actor.effects.find(eff => eff.label === 'Cloudkill');
	if (effect)	MidiQOL.doOverTimeEffect(token.actor, effect, true);
}

// When Left
await HomebrewMacros.cloudkillEffects([token.id]);