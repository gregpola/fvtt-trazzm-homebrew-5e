/*
	If you move at least 20 feet straight toward a target and then hit it with a Gore attack on the same turn, and if
	the target is Large or smaller, it must make a Strength saving throw against your DC of 8 + your proficiency bonus
	+ your Strength modifier. On a failed save, you knock the target Prone.
 */
const version = "11.0";
const optionName = "Goring Charge";

try {
	let targetToken = workflow?.hitTargets?.first();

	if ((args[0].macroPass === "DamageBonus") && targetToken) {
		// check the target's size, must be Large or smaller to knock prone
		const tsize = targetToken.actor.system.traits.size;
		if (["tiny","sm","med","lg"].includes(tsize)) {
			// build DC
			const saveDC = 8 + actor.system.attributes.prof + actor.system.abilities.str.mod;

			const saveFlavor = `${CONFIG.DND5E.abilities["str"].label} Save DC: ${saveDC} - ${optionName}`;
			let saveRoll = await targetToken.actor.rollAbilitySave("str", {flavor: saveFlavor});
			if (saveRoll.total < saveDC) {
				shoveProne(actor, targetToken)
			}
		}
	}
	else if (args[0].macroPass === "preItemRoll") {
		targetToken = workflow?.targets?.first();
		return await HomebrewMacros.chargeTarget(token, targetToken, 20);
	}
	
} catch (err) {
	console.error(`${optionName} - ${version}`, err);
}

async function shoveProne(shover, defender){
	const uuid = defender.actor.uuid;
	const hasEffectApplied = await game.dfreds.effectInterface.hasEffectApplied('Prone', uuid);
	if (!hasEffectApplied) {
		await game.dfreds.effectInterface.addEffect({
			'effectName': 'Prone',
			'uuid': uuid,
			'origin': shover.uuid,
			'overlay': false
		});
		ChatMessage.create({'content': `${shover.name} knocks ${defender.name} prone!`});
	}
}
