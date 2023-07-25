/*
	If the bugbear surprises a creature and hits it with an attack during the first round of combat, the target takes
	an extra 7 (2d6) damage from the attack.
*/
const version = "10.0";
const optionName = "Surprise Attack";

try {
	if (args[0].macroPass === "DamageBonus") {
		const wf = scope.workflow;
		const targetToken = wf.hitTargets.first();

		// skip if it isn't round 1
		if (game.combat.round !== 1) {
			console.log(`${optionName} - not round 1 of combat`);
			return {};
		}

		// skip if the target is not marked as surprised
		let surprised = targetToken.actor.effects.find(eff => eff.label === "Surprised");
		if (!surprised) {
			ui.notifications.error(`${optionName} - target is not surprised`);
			console.log(`${optionName} - target is not surprised`);
			return {};
		}

		// Skip if the action isn't an attack roll
		if (!["mwak", "rwak", "msak", "rsak"].includes(wf.item.system.actionType)) {
			console.log(`${optionName} - action type isn't applicable`);
			return {};
		}
		const diceCount = wf.isCritical ? 4: 2;
		return {damageRoll: `${diceCount}d6`, flavor: optionName};
	}
	
} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
