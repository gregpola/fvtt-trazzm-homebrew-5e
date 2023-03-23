const version = "10.0.1";
const optionName = "Wall of Fire";

/*
	When Deleted
*/
let touchedTokens = template.flags.world?.spell?.WallofFire?.touchedTokens;
for (let i = 0; touchedTokens.length > i; i++) {
	let tokenDoc = canvas.scene.tokens.get(touchedTokens[i]);
	if (!tokenDoc) continue;
	await tokenDoc.unsetFlag('world', 'spell.WallofFire.' + template.id);
}
if (touchedTokens) await HomebrewMacros.wallOfFireEffects(touchedTokens);


/*
	When Entered
*/
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
await sleep(10);

await HomebrewMacros.wallOfFireEffects([token.id]);
let touchedTokens = template.flags.world?.spell?.WallofFire?.touchedTokens || [];
if (!touchedTokens.includes(token.id)) {
	touchedTokens.push(token.id);
}
await template.setFlag('world', 'spell.WallofFire', {touchedTokens});

let doDamage = false;
if (game.combat != null && game.combat != undefined) {
	let combatTurn = game.combat.round + '-' + game.combat.turn;
	let tokenTurn = token.document.getFlag('world', `spell.WallofFire.${template.id}.turn`);
	if (tokenTurn != combatTurn) doDamage = true;
	token.document.setFlag('world', `spell.WallofFire.${template.id}.turn`, combatTurn);
} else {
	doDamage = true;
}

if (doDamage) {
	let effect = token.actor.effects.find(eff => eff.label === 'WallofFire');
	if (effect)	
		await MidiQOL.doOverTimeEffect(token.actor, effect, false);
}


/*
	When Left
*/
await HomebrewMacros.wallOfFireEffects([token.id]);

/*
	When Staying
*/
