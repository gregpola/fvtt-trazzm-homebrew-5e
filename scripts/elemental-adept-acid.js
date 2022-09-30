/*****
Elemental Adept 
USAGE: This is fully automated, just place on the feat on the character
*****/
const version = "0.1.0";
const damageType = "acid";

try {
	// make sure the attempted hit was made with a spell attack of some type
	if (!["msak", "rsak", "save"].includes(args[0].item.data.actionType)) return;
	
	if (args[0].macroPass === "DamageBonus") {
		const theItem = MidiQOL.Workflow.getWorkflow(args[0].uuid).item;
		let itemData = theItem.data.data;
		const targets = args[0].targets;
		
		let dr = args[0].damageRoll;
		if (!dr) return;
		
		// todo check the attacks damage type
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
			let resistant = target?.actor.data.data.traits.dr?.value.includes(damageType);
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
