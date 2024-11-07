/*
	When you use your action to Dash, you can use a bonus action to make one melee weapon attack or to shove a creature.

	If you move at least 10 feet in a straight line immediately before taking this bonus action, you either gain a +5 bonus
	to the attack’s damage roll (if you chose to make a melee attack and hit) or push the target up to 10 feet away from
	you (if you chose to shove and succeed).
*/
const version = "11.0";
const optionName = "Charger";
let target = workflow.targets.first();

try {
	// Ask which option they want to take
	new Dialog({
	  title: `${optionName}`,
	  content: "Which action do you want to take?",
	  buttons: {
		A: { label: "Melee Weapon Attack", callback: () => { return MeleeAttack(); } },
		C: { label: "Shove (Push)", callback: () => { return ShoveKnockback(); } },
	  }
	}).render(true);

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function MeleeAttack() {
	// TODO check movement
	const effect_sourceData = {
		changes: [{ key: "system.bonuses.mwak.damage", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: +5, priority: 20 }
		],
		origin: workflow.item.uuid,
		duration: game.combat ? { rounds: 1, turns:0, startRound: `${game.combat.round}`, startTurn: `${game.combat.turn}`, startTime: `${game.time.worldTime}`} : {seconds: 6, startTime: `${game.time.worldTime}`},
		icon: "icons/creatures/mammals/deer-movement-leap-green.webp",
		label: "Charger feat - Bonus to damage",
		flags: {dae: {specialDuration: ['DamageDealt']}},
	}
	
	if (actor.effects.find(i=>i.name==="Charger feat - Bonus to damage")) {
		let effect = actor.effects.find(i => i.name === "Charger feat - Bonus to damage" );
		await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [effect.id] });
	}
	
	await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effect_sourceData] });
}

async function ShoveKnockback() {
	// TODO check movement for bonus distance
	let squaresPushed = 2;
	let actorRoll = await actor.rollSkill("ath");
	await game.dice3d?.showForRoll(actorRoll);

	let skill = target.actor.system.skills.ath.total < target.actor.system.skills.acr.total ? "acr" : "ath";
	let tokenRoll = await target.actor.rollSkill(skill);
	await game.dice3d?.showForRoll(tokenRoll);
	
	if (actorRoll.total >= tokenRoll.total) {
		await HomebrewMacros.pushTarget(token, target, squaresPushed);
		ChatMessage.create({'content': `${actor.name} pushes ${target.name} back!`});
	}
	else {
		ChatMessage.create({'content': `${actor.name} is to weak to push ${target.name} back!`});
	}
}
