/*
	Template macros for the Create Bonfire spell
*/
const version = "10.0.0";
const optionName = "Create Bonfire";

/*
	When Deleted
*/
let touchedTokens = template.flags.world?.spell?.CreateBonfire?.touchedTokens;
for (let i = 0; touchedTokens.length > i; i++) {
	let tokenDoc = canvas.scene.tokens.get(touchedTokens[i]);
	if (!tokenDoc) continue;
	await tokenDoc.unsetFlag('world', 'spell.CreateBonfire.' + template.id);
}
if (touchedTokens) await HomebrewMacros.createBonfireEffects(touchedTokens);


/*
	When Entered
*/
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
await sleep(10);
await HomebrewMacros.createBonfireEffects([token.id]);

let cantripDice = template.flags.world?.spell?.CreateBonfire?.cantripDice;
let spelldc = template.flags.world?.spell?.CreateBonfire?.spelldc;
let touchedTokens = template.flags.world?.spell?.CreateBonfire?.touchedTokens || [];
if (!touchedTokens.includes(token.id)) touchedTokens.push(token.id);
await template.setFlag('world', 'spell.CreateBonfire', {cantripDice, spelldc, touchedTokens});

let doDamage = false;
if (game.combat != null && game.combat != undefined) {
	let combatTurn = game.combat.round + '-' + game.combat.turn;
	let tokenTurn = token.document.getFlag('world', `spell.CreateBonfire.${template.id}.turn`);
	if (tokenTurn != combatTurn) doDamage = true;
	token.document.setFlag('world', `spell.CreateBonfire.${template.id}.turn`, combatTurn);
} else {
	doDamage = true;
}
if (doDamage) {
	let effect = token.actor.effects.find(eff => eff.label === 'CreateBonfire');
	if (effect)	MidiQOL.doOverTimeEffect(token.actor, effect, true);
}


/*
	When Left
*/
await HomebrewMacros.createBonfireEffects([token.id]);
