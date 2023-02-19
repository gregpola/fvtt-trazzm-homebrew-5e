/*
	When you gain this feat, you gain the following benefits:

	Spells you cast ignore resistance to acid damage. 
	In addition, when you roll damage for a spell you cast that deals acid damage, you can treat any 1 on a damage die as a 2.

	You can select this feat multiple times. Each time you do so, you must choose a different damage type.
*/
const version = "10.0.0";
const optionName = "Elemental Adept";
const damageType = "acid";

const effectUpdate = {
	changes:[{
		key: 'system.traits.dr.value',
		mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
		value: `-${damageType}`
	}],
	label: `Elemental Adept (${damageType})`,
	icon: "icons/svg/aura.svg",
	flags: {dae: { specialDuration: ['isDamaged']} }
};

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const theItem = lastArg.item;
	let itemData = lastArg.itemData;
	
	if (lastArg.macroPass === "preDamageRoll") {
		// make sure the damage type matches
		if (!theItem.system.damage.parts.map(i=>i[1]).includes(damageType)) {
			return;
		}
		
		// make sure the attempted hit was made with a spell attack of some type
		if (!["msak", "rsak", "save"].includes(lastArg.itemData.system.actionType)) {
			return;
		}
		
		// find the resistant targets and turn it off for this attack
		let targets = lastArg.hitTargets;
		for (let target of targets) {
			let resistant = target.actor.system.traits.dr.value.has(damageType);
			if (resistant) {
				await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: target.actor.uuid, effects: [effectUpdate]}); 
			}
		}
	}
	else if (lastArg.macroPass === "postDamageRoll") {
		// check pre-requisites
		// make sure the dmage type matches
		if (!theItem.system.damage.parts.map(i=>i[1]).includes(damageType)) {
			return;
		}
		
		// make sure the attempted hit was made with a spell attack of some type
		if (!["msak", "rsak", "save"].includes(lastArg.itemData.system.actionType)) {
			return;
		}
		
		let isModified = false;
		let terms = lastArg.workflow.damageRoll.terms;
		for (let i = 0; i < terms.length; i++) {
			if ((terms[i] instanceof Die)
				&& (terms[i].options.flavor === damageType)) {
				// look for a 1
				let results = terms[i].results;
				for (let z = 0; z < results.length; z++) {
					if (results[z].result === 1) {
						results[z].result = 2;
						isModified = true;
					}
				}
			}
		}
		
		if (isModified) {
			const newDamageRoll = CONFIG.Dice.DamageRoll.fromTerms(terms);
			await lastArg.workflow.setDamageRoll(newDamageRoll)
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
