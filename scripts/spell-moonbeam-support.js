/*
	Template macros for the Moonbeam spell
*/
const version = "10.0.0";
const optionName = "Moonbeam";

/*
	When Deleted
*/
let touchedTokens = template.flags.world?.spell?.Moonbeam?.touchedTokens;
for (let i = 0; touchedTokens.length > i; i++) {
	let tokenDoc = canvas.scene.tokens.get(touchedTokens[i]);
	if (!tokenDoc) continue;
	await tokenDoc.unsetFlag('world', 'spell.Moonbeam.' + template.id);
}
if (touchedTokens) await HomebrewMacros.moonbeamEffects(touchedTokens);


/*
	When Entered
*/
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
await sleep(10);
await HomebrewMacros.moonbeamEffects([token.id]);

let spellLevel = template.flags.world?.spell?.Moonbeam?.spellLevel;
let spelldc = template.flags.world?.spell?.Moonbeam?.spelldc;
let touchedTokens = template.flags.world?.spell?.Moonbeam?.touchedTokens || [];
let ambientLightId = template.flags.world?.spell?.Moonbeam?.ambientLightId;
if (!touchedTokens.includes(token.id)) touchedTokens.push(token.id);
await template.setFlag('world', 'spell.Moonbeam', {spellLevel, spelldc, touchedTokens, ambientLightId});

let doDamage = false;
if (game.combat != null && game.combat != undefined) {
	let combatTurn = game.combat.round + '-' + game.combat.turn;
	let tokenTurn = token.document.getFlag('world', `spell.Moonbeam.${template.id}.turn`);
	if (tokenTurn != combatTurn) doDamage = true;
	token.document.setFlag('world', `spell.Moonbeam.${template.id}.turn`, combatTurn);
} else {
	doDamage = true;
}
if (doDamage) {
	let effect = token.actor.effects.find(eff => eff.label === 'Moonbeam');
	if (effect)	MidiQOL.doOverTimeEffect(token.actor, effect, true);
}


/*
	When Left
*/
await HomebrewMacros.moonbeamEffects([token.id]);

/*
	When Moved
*/
let oldTouchedTokens = template.flags.world?.spell?.Moonbeam?.touchedTokens || [];
await HomebrewMacros.moonbeamEffects(oldTouchedTokens);

let spellLevel = template.flags.world?.spell?.Moonbeam?.spellLevel;
let spelldc = template.flags.world?.spell?.Moonbeam?.spelldc;
let touchedTokens = await game.modules.get('templatemacro').api.findContained(template);
let ambientLightId = template.flags.world?.spell?.Moonbeam?.ambientLightId;

await template.setFlag('world', 'spell.Moonbeam', {spellLevel, spelldc, touchedTokens, ambientLightId});
await HomebrewMacros.moonbeamEffects(touchedTokens);

// move the ambient light
let newPosition = [];
newPosition.push({
	_id:ambientLightId,
	x: template.x,
	y: template.y
});
canvas.scene.updateEmbeddedDocuments("AmbientLight", newPosition);
