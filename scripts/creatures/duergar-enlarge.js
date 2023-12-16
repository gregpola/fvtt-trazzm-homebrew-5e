/*
	For 1 minute, the duergar magically increases in size, along with anything it is wearing or carrying. While enlarged,
	the duergar is Large, doubles its damage dice on Strength-based weapon attacks (included in the attacks), and makes
	Strength checks and Strength saving throws with advantage. If the duergar lacks the room to become Large, it attains
	the maximum size possible in the space available.
*/
const version = "11.0";
const optionName = "Duergar - Enlarge";
const mutationFlag = "duergar-enlarge";

try {
    if (args[0] === "on") {
        const updates = {
            token: {
                width: 2,
                height: 2
            },
            actor: {
                "system.traits.size": "lg"
            }
        }
        await warpgate.mutate(token.document, updates, {}, { name: mutationFlag });
    }
    else if (args[0] === "off") {
        await warpgate.revert(token.document, mutationFlag);
    }
    else if (args[0].macroPass === "postDamageRoll") {
        if (workflow.isFumble || (workflow.hitTargets.size === 0))
            return {};

        // make sure it's an allowed attack
        if (!["mwak", "rwak"].includes(workflow.item.system.actionType)) {
            console.log(`${optionName}: not an eligible attack`);
            return {};
        }

        // make sure the modifier is strength
        if (workflow.item.system.properties?.fin) {
            let str = this.actor.system.abilities.str.value;
            let dex = this.actor.system.abilities.dex.value;
            if (str < dex) return {};
        }

        for (let i = 0; i < workflow.damageRoll.terms.length; i++) {
            if (workflow.damageRoll.terms[i] instanceof Die) {
                let dieCount = workflow.damageRoll.terms[i].number;
                workflow.damageRoll.terms[i].number = 2 * dieCount;
            }
        }

        const newDamageRoll = CONFIG.Dice.DamageRoll.fromTerms(workflow.damageRoll.terms);
        let damageRoll = await new Roll(newDamageRoll.formula).roll({async: true});
        await workflow.setDamageRoll(damageRoll);
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
