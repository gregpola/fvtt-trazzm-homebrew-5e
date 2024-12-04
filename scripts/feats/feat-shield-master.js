/*
	You use shields not just for protection but also for offense. You gain the following benefits while you are wielding a shield:

	- If you take the Attack action on your turn, you can use a bonus action to try to shove a creature within 5 feet of
		you with your shield.
	- If you aren't Incapacitated, you can add your shield's AC bonus to any Dexterity saving throw you make against a
		spell or other harmful effect that targets only you.
	- If you are subjected to an effect that allows you to make a Dexterity saving throw to take only half damage, you
		can use your reaction to take no damage if you succeed on the saving throw, interposing your shield between yourself
		and the source of the effect.
 */
const version = "11.0";
const optionName = "Shield Master";

try {
	new Dialog({
	  title: `${optionName} - Shove`,
	  content: "Which Shove Action?",
	  buttons: {
		A: { label: "Shove (Prone)", callback: () => { return ShoveProne(); } },
		B: { label: "Shove (Knockback)", callback: () => { return ShoveKnockback(); } },
	  }
	}).render(true);

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function ShoveProne(){
	let defender = workflow.targets.first();
	ChatMessage.create({'content': `${actor.name} tries to shove ${defender.name} to the ground!`})

	const skilltoberolled = defender.actor.system.skills.ath.total < defender.actor.system.skills.acr.total ? "acr" : "ath";
	let results = await game.MonksTokenBar.requestContestedRoll({token: token, request: 'skill:ath'},
		{token: defender, request:`skill:${skilltoberolled}`},
		{silent:true, fastForward:false, flavor: `${defender.name} tries to resist ${actor.name}'s shove attempt`});

	let i=0;
	while (results.flags['monks-tokenbar'][`token${token.id}`].passed === "waiting" && i < 30) {
		await new Promise(resolve => setTimeout(resolve, 500));
		i++;
	}

	let result = results.flags["monks-tokenbar"][`token${token.id}`].passed;
	if (result === "won" || result === "tied") {
		ChatMessage.create({'content': `${actor.name} knocks ${defender.name} prone!`});
		const hasEffectApplied = await game.dfreds.effectInterface.hasEffectApplied('Prone', defender.actor.uuid);
		if (!hasEffectApplied) {
			await game.dfreds.effectInterface.addEffect({
				'effectName': 'Prone',
				'uuid': defender.actor.uuid,
				'origin': workflow.origin,
				'overlay': false
			});
		}
	}
	else {
		ChatMessage.create({'content': `${actor.name} fails to overcome ${defender.name} defenenses`});
	}
}

async function ShoveKnockback(){
	let defender = workflow.targets.first();
	ChatMessage.create({'content': `${actor.name} tries to shove ${defender.name} back 5 feet!`})

	const skilltoberolled = defender.actor.system.skills.ath.total < defender.actor.system.skills.acr.total ? "acr" : "ath";
	let results = await game.MonksTokenBar.requestContestedRoll({token: token, request: 'skill:ath'},
		{token: defender, request:`skill:${skilltoberolled}`},
		{silent:true, fastForward:false, flavor: `${defender.name} tries to resist ${actor.name}'s shove attempt`});

	let i=0;
	while (results.flags['monks-tokenbar'][`token${token.id}`].passed === "waiting" && i < 30) {
		await new Promise(resolve => setTimeout(resolve, 500));
		i++;
	}

	let result = results.flags["monks-tokenbar"][`token${token.id}`].passed;
	if (result === "won" || result === "tied") {
		await HomebrewMacros.pushTarget(token, defender, 1);
		ChatMessage.create({'content': `${actor.name} pushes ${defender.name} back!`});
	}
	else {
		ChatMessage.create({'content': `${actor.name} is to weak to push ${defender.name} back!`});
	}
}
