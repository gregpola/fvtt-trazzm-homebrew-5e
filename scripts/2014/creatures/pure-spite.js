/*
	When the matron’s hit points are reduced below half of its maximum and has either the grappled, poisoned, or prone conditions due to the actions of an enemy that has not yet been vanquished, the matron may treat any die roll of 1 or 2 as a 3 when determining damage from spells or weapon attacks made against that enemy. This immediately ends if the enemy is brought to 0 HP or if the condition ends.
*/
const version = "10.0.0";
const optionName = "Pure Spite";

try {
	if (args[0].macroPass === "postDamageRoll") {
		const lastArg = args[args.length - 1];
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);

		// Must be an attack
		if (!["mwak", "rwak", "msak", "rsak"].includes(lastArg.itemData.system.actionType))
			return {};
		
		// Must be below half hit points
		const hpValue = actor.system.attributes.hp.value;
		const hpMax = actor.system.attributes.hp.max;
		if (hpValue >= (hpMax / 2))
			return {};

		// Must be grappled, poisoned or prone
		let hasCondition = false;
		if (actor.effects.find(ef => ef.label === "Grappled"))
			hasCondition = true;
		if (actor.effects.find(ef => ef.label === "Poisoned"))
			hasCondition = true;
		if (actor.effects.find(ef => ef.label === "Restrained"))
			hasCondition = true;
		
		if (hasCondition) {
			for (let i = 0; i < lastArg.workflow.damageRoll.terms.length; i++) {
				if (lastArg.workflow.damageRoll.terms[i] instanceof Die) {
					for (let r of lastArg.workflow.damageRoll.terms[i].results) {
						if (r.result === 1 || r.result === 2) {
							r.result = 3;
						}
					}
				}
			}
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
