const version = "10.1";
const optionName = "Bigby's Hand";
const summonFlag = "bigbys-hand";
const actorSizes = ["tiny","sm","med","lg", "huge", "grg"];

// Forceful Hand
const defender = workflow.targets.first();
const defenderSize = defender.actor.system.traits.size;
const gindex = actorSizes.indexOf("med");
const dindex = actorSizes.indexOf(defenderSize);
const withAdvantage = (dindex <= gindex);
let maxSquares = 1;
const flagValue = actor.getFlag("midi-qol", summonFlag);
if (flagValue) {
	maxSquares = maxSquares + Number(flagValue);
}

// run opposed check
let results = await game.MonksTokenBar.requestContestedRoll({token: token, request: 'ability:str', advantage: withAdvantage},
	{token: defender, request:'skill:ath'},
	{silent:true, fastForward:false, flavor: `${defender.name} tries to resist ${token.name}'s shove attempt`});

let i=0;
while (results.flags['monks-tokenbar'][`token${token.id}`].passed === "waiting" && i < 30) {
	await new Promise(resolve => setTimeout(resolve, 500));
	i++;
}

let result = results.flags["monks-tokenbar"][`token${token.id}`].passed;
if (result === "won" || result === "tied") {
	await HomebrewMacros.pushTarget(token, defender, 1);
	ChatMessage.create({'content': `${token.name} pushes ${defender.name}`})
}
