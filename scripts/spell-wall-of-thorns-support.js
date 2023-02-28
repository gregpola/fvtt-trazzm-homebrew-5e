/*
	You create a wall of tough, pliable, tangled brush bristling with needle-sharp thorns. The wall appears within range on a solid surface and lasts for the duration. You choose to make the wall up to 60 feet long, 10 feet high, and 5 feet thick or a circle that has a 20-foot diameter and is up to 20 feet high and 5 feet thick. The wall blocks line of sight.

	When the wall appears, each creature within its area must make a Dexterity saving throw. On a failed save, a creature takes 7d8 piercing damage, or half as much damage on a successful save.

	A creature can move through the wall, albeit slowly and painfully. For every 1 foot a creature moves through the wall, it must spend 4 feet of movement. Furthermore, the first time a creature enters the wall on a turn or ends its turn there, the creature must make a Dexterity saving throw. It takes 7d8 slashing damage on a failed save, or half as much damage on a successful one.

	At Higher Levels. When you cast this spell using a spell slot of 7th level or higher, both types of damage increase by 1d8 for each slot level above 6th.
*/
const version = "10.0.0";
const optionName = "Wall of Thorns";

/*
	When Deleted
*/
let touchedTokens = template.flags.world?.spell?.WallofThorns?.touchedTokens;
for (let i = 0; touchedTokens.length > i; i++) {
	let tokenDoc = canvas.scene.tokens.get(touchedTokens[i]);
	if (!tokenDoc) continue;
	await tokenDoc.unsetFlag('world', 'spell.WallofThorns.' + template.id);
}
if (touchedTokens) await HomebrewMacros.wallOfThornsEffects(touchedTokens);


/*
	When Entered
*/
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
await sleep(10);
await HomebrewMacros.wallOfThornsEffects([token.id]);
let touchedTokens = template.flags.world?.spell?.WallofThorns?.touchedTokens || [];
if (!touchedTokens.includes(token.id)) touchedTokens.push(token.id);
await template.setFlag('world', 'spell.WallofThorns', {touchedTokens});
let doDamage = false;
if (game.combat != null && game.combat != undefined) {
	let combatTurn = game.combat.round + '-' + game.combat.turn;
	let tokenTurn = token.document.getFlag('world', `spell.WallofThorns.${template.id}.turn`);
	if (tokenTurn != combatTurn) doDamage = true;
	token.document.setFlag('world', `spell.WallofThorns.${template.id}.turn`, combatTurn);
} else {
	doDamage = true;
}
if (doDamage) {
	let effect = token.actor.effects.find(eff => eff.label === 'WallofThorns');
	if (effect)	MidiQOL.doOverTimeEffect(token.actor, effect, true);
}


/*
	When Left
*/
await HomebrewMacros.wallOfThornsEffects([token.id]);

/*
	When Staying
*/
