const version = "10.0.0";
const optionName = "Bigby's Hand";
const summonFlag = "bigbys-hand";
const actorSizes = ["tiny","sm","med","lg", "huge", "grg"];

// Forceful Hand
const lastArg = args[args.length - 1];
let shover = canvas.tokens.get(lastArg.tokenId);
const defender = lastArg.targets[0];
const defenderToken = canvas.tokens.get(defender.id);
			
const defenderSize = defenderToken.actor.system.traits.size;
const gindex = actorSizes.indexOf("med");
const dindex = actorSizes.indexOf(defenderSize);
const withAdvantage = (dindex <= gindex);
let maxSquares = 1;
const flagValue = shover.actor.getFlag("midi-qol", summonFlag);
if (flagValue) {
	maxSquares = maxSquares + Number(flagValue);
}

// run opposed check
let shoverRoll = await shover.actor.rollAbilityTest("str", {advantage: withAdvantage});
let defenderRoll = await defenderToken.actor.rollSkill("ath");
if (shoverRoll.total >= defenderRoll.total) {
	// move the target
	const maxRange = maxSquares * 5;
	const position = await HomebrewMacros.warpgateCrosshairs(defenderToken, maxRange, lastArg.item, defenderToken);
	if (position) {
		// check for token collision
		let newCenter = canvas.grid.getSnappedPosition(position.x - defenderToken.width / 2, position.y - defenderToken.height / 2, 1);
		if (HomebrewMacros.checkPosition(newCenter.x, newCenter.y)) {
			ui.notifications.error(`${optionName} - can't shove on top of another token`);
			return;
		}
		
		const xdiff = defenderToken.center.x - shover.center.x;
		const ydiff = defenderToken.center.y - shover.center.y;
		await defenderToken.document.update(newCenter, {animate: false});
		let pos = canvas.grid.getSnappedPosition(position.x + xdiff - 5, position.y + ydiff - 5, 1);
		await shover.document.update(pos, {animate : false});
	}
	else {
		ui.notifications.error(`${optionName} - invalid shove location`);
		return false;
	}
}

