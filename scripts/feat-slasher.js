/*
	 You’ve learned where to cut to have the greatest results, granting you the following benefits:

	 * Increase your Strength or Dexterity by 1, to a maximum of 20.
	 * Once per turn when you hit a creature with an attack that deals slashing damage, you can reduce the speed of the
	 	target by 10 feet until the start of your next turn.
	 * When you score a critical hit that deals slashing damage to a creature, you grievously wound it. Until the start
	 	of your next turn, the target has disadvantage on all attack rolls.
 */
const version = "11.0";
const optionName = "Slasher";
const flagDisadvantage = "Slasher feat - Disadvantage";
const flagMovement = "Slasher feat - Movement Reduction";

try {
	// check for pre-conditions
	if (workflow.hitTargets.size < 1) {
		return;
	}

	if (!["mwak", "rwak", "msak", "rsak"].includes(workflow.item.system.actionType)
		|| (workflow.damageDetail.filter(i=>i.type === "slashing").length < 1)) {
		console.log(`${optionName} not allowed: not a slashing attack`);
		return;
	}

	const targetActor = workflow.hitTargets.first().actor;

	if (workflow.isCritical) {
		await applyTargetDisadvantageEffect(targetActor);
	}

	if (isAvailableThisTurn()) {
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				title: "Slasher's feat - movement reduction",
				content: "<p>Do you want to reduce the creature's speed by 10ft?</p>",
				buttons: {
					one: {
						icon: '<i class="fas fa-check"></i>',
						label: "Yes",
						callback: () => resolve(true)
					},
					two: {
						icon: '<i class="fas fa-times"></i>',
						label: "No",
						callback: () => {resolve(false)}
					}
				},
				default: "two"
			}).render(true);
		});
		let result = await dialog;
		if (result) {
			applySpeedReduction(targetActor);
			const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
			await actor.setFlag('midi-qol', 'slasherTime', `${combatTime}`);
		}
	}

} catch (err) {
    console.error(`Slasher feat ${version}`, err);
}

function isAvailableThisTurn() {
	if (game.combat) {
		const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
		const lastTime = actor.getFlag("midi-qol", "slasherTime");
		if (combatTime === lastTime) {
			console.log("Slasher: already reduced a target's movement this turn");
			return false;
		}

		return true;
	}

	return false;
}

async function applyTargetDisadvantageEffect(targetActor) {
	const effect_sourceData = {
		name: flagDisadvantage,
		origin: actor.uuid,
		changes: [
			{ key: "flags.midi-qol.disadvantage.attack.all", mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: 1, priority: 20 }
		],
		duration: game.combat ? { rounds: 1, turns:0, startRound: `${game.combat.round}`, startTurn: `${game.combat.turn}`, startTime: `${game.time.worldTime}`} : {seconds: 6, startTime: `${game.time.worldTime}`},
		icon: "icons/skills/melee/strike-sword-gray.webp",
		flags: {dae: {specialDuration: ['turnStartSource']}},
	}
	await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetActor.uuid, effects: [effect_sourceData] });
}

async function applySpeedReduction(targetActor) {
    const effect_sourceData = {
		label: flagMovement,
		origin: actor.uuid,
        changes: [
            { key: "system.attributes.movement.all", mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: -10, priority: 20 }
        ], 
        duration: game.combat ? { rounds: 1, turns:0, startRound: `${game.combat.round}`, startTurn: `${game.combat.turn}`, startTime: `${game.time.worldTime}`} : {seconds: 6, startTime: `${game.time.worldTime}`},
        icon: "icons/skills/melee/strike-sword-gray.webp",
        flags: {dae: {specialDuration: ['turnStartSource']}},
    }
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetActor.uuid, effects: [effect_sourceData] });
}
