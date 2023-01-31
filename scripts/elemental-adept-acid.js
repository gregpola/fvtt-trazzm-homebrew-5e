/*
When you gain this feat, you gain the following benefits:

Spells you cast ignore resistance to acid damage. In addition, when you roll damage for a spell you cast that deals acid damage, you can treat any 1 on a damage die as a 2.

You can select this feat multiple times. Each time you do so, you must choose a different damage type.
*/
const version = "10.0.0";
const optionName = "Elemental Adept";
const damageType = "acid";
const lastArg = args[args.length - 1];

try {
	// make sure the attempted hit was made with a spell attack of some type
	if (!["msak", "rsak", "save"].includes(lastArg.itemData.system.actionType)) return;
	
	if (lastArg.macroPass === "DamageBonus") {
		let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		const theItem = lastArg.item;
		let itemData = lastArg.itemData;
		let targets = lastArg.hitTargets;

		let dr = lastArg.damageRoll;
		if (!dr) return;
		
		// check the attacks damage type
		let damageTypeResult = 0;
		for (let term of dr.terms) {
			if (term.options?.flavor?.includes(damageType)) {
				let bonus = sumResults(term.results);
				if (bonus) {
					damageTypeResult += bonus;
				}
			}
		}
		
		// no matching damage type
		if (damageTypeResult === 0) return;
		
		// build the two target lists
		let resistantTargets = new Set();
		let otherTargets = new Set();

		// find the resistant targets
		for (let target of targets) {
			let resistant = target.actor.system.traits.dr.value.has(damageType);
			if (resistant)
				resistantTargets.add(target);
			else
				otherTargets.add(target);
		}
		
		if (resistantTargets.size > 0 ) {
			// double the damage to simulate no resistance
			await MidiQOL.applyTokenDamage([{ damage: damageTypeResult, type: damageType }], damageTypeResult, resistantTargets, theItem, new Set());
		}

		if (otherTargets.size > 0 ) {
			// get the bonus damage for changing 1's to 2's
			const improveDamage = sumImprovedDamage(results);
			
			// double the damage to simulate no resistance
			await MidiQOL.applyTokenDamage([{ damage: improveDamage, type: damageType }], improveDamage, resistantTargets, theItem, new Set());
		}
		
	}

	return;
	
} catch (err) {
    console.error(`Elemental Adept ${damageType} ${version}`, err);
}

function sumResults(results) {
	let result = 0;
	let minBonus = 0; // damage bonus for feat changing all 1's to 2's
	if (results) {
		for(let item of results) {
			result += item.result;
			if (item.result === 1) {
				minBonus += 1;
			}			
		}
	}
	
	// adjust the damage bonus for overcoming resistance rounding down odd values
	if (result % 2) {
		result++;
	}
	
	if (minBonus % 2) {
		minBonus++;
	}
	
	result += minBonus;
	
	return result;
}

function sumImprovedDamage(results) {
	let result = 0;
	let minBonus = 0; // damage bonus for feat changing all 1's to 2's
	if (results) {
		for(let item of results) {
			result += item.result;
			if (item.result === 1) {
				minBonus += 1;
			}			
		}
	}
	
	result += minBonus;
	return result;
}
