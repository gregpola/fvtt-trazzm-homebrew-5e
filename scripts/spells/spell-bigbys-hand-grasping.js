const version = "10.2";
const optionName = "Bigby's Hand";
const summonFlag = "bigbys-hand";
const actorSizes = ["tiny","sm","med","lg", "huge", "grg"];

// Grasping Hand
const defender = workflow.targets.first();
const defenderSize = defender.actor.system.traits.size;
const dindex = actorSizes.indexOf(defenderSize);

const hugeIndex = actorSizes.indexOf("huge");
if (dindex > hugeIndex) {
	ui.notifications.error(`${optionName}: target is too big to grapple`);
	return;
}

// run opposed check
const skilltoberolled = defender.actor.system.skills.ath.total < defender.actor.system.skills.acr.total ? "acr" : "ath";
let results = await game.MonksTokenBar.requestContestedRoll({token: token, request: 'skill:ath'},
	{token: defender, request:`skill:${skilltoberolled}`},
	{silent:true, fastForward:false, flavor: `${defender.name} tries to resist ${token.name}'s grapple attempt`});

let i=0;
while (results.flags['monks-tokenbar'][`token${token.id}`].passed === "waiting" && i < 30) {
	await new Promise(resolve => setTimeout(resolve, 500));
	i++;
}

let result = results.flags["monks-tokenbar"][`token${token.id}`].passed;
if (result === "won" || result === "tied") {
	let grappled = await HomebrewMacros.applyGrappled(token, defender, item, 'opposed');
	ChatMessage.create({'content': `${token.name} grapples ${defender.name}`})
}
