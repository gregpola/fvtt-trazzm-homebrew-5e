/*
	You hurl an undulating, warbling mass of chaotic energy at one creature in range. Make a ranged spell attack against the target. On a hit, the target takes 2d8 + 1d6 damage. Choose one of the d8s. The number rolled on that die determines the attack’s damage type, as shown below.
	
	If you roll the same number on both d8s, the chaotic energy leaps from the target to a different creature of your choice within 30 feet of it. Make a new attack roll against the new target, and make a new damage roll, which could cause the chaotic energy to leap again.

	A creature can be targeted only once by each casting of this spell.

	At Higher Levels. When you cast this spell using a spell slot of 2nd level or higher, each target takes 1d6 extra damage of the type rolled for each slot level above 1st.
*/
const version = "10.0.0";
const optionName = "Chaos Bolt";
const damageList = { 1: "acid", 2: "cold", 3: "fire", 4: "force", 5: "lightning", 6: "poison", 7: "psychic", 8: "thunder" };

const lastArg = args[args.length - 1];
const actorD = game.actors.get(lastArg.actor._id);
const tokenD = canvas.tokens.get(lastArg.tokenId);
const itemD = lastArg.item;
const spellLevel = Number(lastArg.spellLevel);
const upcast = spellLevel;
let target;

try {

	if (args[0].macroPass === "postActiveEffects") {
		if (lastArg.hitTargets.length > 0) {
			target = canvas.tokens.get(lastArg.hitTargets[0].id);
			await dealDamage(target, null, null, itemD);  
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function findTarget(target, itemD) {
	let get_targets = await MidiQOL.findNearby(CONST.TOKEN_DISPOSITIONS.FRIENDLY, target, 30, null);
	await rollAttack(get_targets, itemD);
}

async function rollAttack(get_targets, itemD) {
	let targetList;
	for (let target of get_targets) {
		targetList += `<option value="${target.id}">${target.name}</option>`;
	}

	let dialog = new Promise((resolve) => {
		new Dialog({
			title: `${itemD.name} : New Target`,
			content: `<form><div class="form-group"><label for="target">Pick Target</label><select id="target">${targetList}</select></div></form>`,
			buttons: {
				attack: {
					label: "Attack",
					callback: async (html) => {
						let find_target = html.find('#target').val();
						let get_target = canvas.tokens.get(find_target);
						await get_target.setTarget(true, { releaseOthers: true });
						
						let roll = actorD.items.get(itemD._id).rollAttack();
						if (roll.total >= get_target.actor.system.attributes.ac.value) {
							const newCritical = roll.terms[0].total === 20 ? true : false;
							await dealDamage(get_target, 1, newCritical, itemD);
						}
						resolve();
					}
				}
			},
			default: "attack"
		}).render(true);
	});
	await dialog;
}

async function dealDamage(target, reCast, newCritical, itemD) {
	let firstTerm = ((newCritical || lastArg.isCritical) ? '4d8' : '2d8');
	let secondTerm = ((newCritical || lastArg.isCritical) ? `${upcast * 2}d6` : `${upcast}d6`);
	//let numDice = newCritical ? `1d8 + 1d8 + 2d8 + ${upcast * 2}d6` : lastArg.isCritical ? `1d8 + 1d8 + 2d8 + ${upcast * 2}d6` : `1d8 + 1d8 + ${upcast}d6`;
	let damageRoll = new Roll(`${firstTerm} + ${secondTerm}`).evaluate({ async: false });
	game.dice3d?.showForRoll(damageRoll);
	
	let firstElement = damageList[damageRoll.terms[0].results[0].result];
	let secondElement = damageList[damageRoll.terms[0].results[1].result];
	let selectElement;
	let castAgain = 0;
	
	let elementList = [];
	if (firstElement != secondElement) {
		elementList.push(firstElement);
		elementList.push(secondElement);
		castAgain = 0;
	} else {
		elementList.push(firstElement);
		castAgain = 1;
	}
	
	for (let element of elementList) {
		selectElement += `<option value="${element}">${element}</option>`;
	}
	
	if (firstElement === secondElement) {
		damageRoll.terms[0].flavor = firstElement;
		damageRoll.terms[2].flavor = firstElement;
		//game.dice3d?.showForRoll(damageRoll);
		
		if (reCast === 1) {
			let msgHistory = game.messages.filter(i => i.flavor === itemD.name && i.speaker.token === tokenD.id);
			let lastMessage = msgHistory.pop();
			let newId = lastMessage._id;
			await workflowDamage(damageRoll, firstElement, target, newId, itemD);
		} 
		else {
			await workflowDamage(damageRoll, firstElement, target, lastArg.itemCardId, itemD);
		}
		
		if (castAgain === 1) {
			await findTarget(target, itemD);
		}
		
	}
	else {
		let the_message = `<form><div class="form-group">
			<p><label for="element">Pick Element</label></p>
			<p><select id="element">${selectElement}</select></p>
			</div></form>`;
		
		let dialog = new Promise((resolve) => {
			new Dialog({
				title: itemD.name,
				content: the_message,
				buttons: {
					damage: {
						label: "Damage",
						callback: async (html) => {
							let element = html.find('#element').val();
							damageRoll.terms[0].flavor = element;
							damageRoll.terms[2].flavor = element;
							//game.dice3d?.showForRoll(damageRoll);

							if (reCast === 1) {
								let msgHistory = game.messages.filter(i => i.flavor === itemD.name && i.speaker.token === tokenD.id);
								let lastMessage = msgHistory.pop();
								let newId = lastMessage._id;
								await workflowDamage(damageRoll, element, target, newId, itemD);
							}
							else {
								await workflowDamage(damageRoll, element, target, lastArg.itemCardId, itemD);
							}
							
							resolve();
						}
					}
				},
				default: "damage"
			}).render(true);
		});
		await dialog;
	}
}

async function workflowDamage(damageRoll, element, target, cardId, itemD) {
	let damageWorkflow = await new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRoll.total, element, [target], damageRoll, { flavor: `(${element})`,
	itemCardId: cardId, itemData: itemD, useOther: false });
	let damageBonusMacro = getProperty(actorD.flags, `${game.system.id}.DamageBonusMacro`);
	if (damageBonusMacro) {
		await damageWorkflow.rollBonusDamage(damageBonusMacro);
	}
	else {
		await damageWorkflow;
	}
}

//a switch that could be used for different animations at some point...
async function getDamageType(diceRoll){
    switch(diceRoll) {
        case 1: return [["acid"],["icons/magic/acid/dissolve-arm-flesh.webp"]];
        
        case 2: return [["cold"],["icons/magic/water/snowflake-ice-snow-white.webp"]];
 
        case 3: return [["fire"],["icons/magic/fire/flame-burning-campfire-orange.webp"]];

        case 4: return [["force"],["icons/magic/control/buff-strength-muscle-damage-red.webp"]];

        case 5: return [["lightning"],["icons/magic/lightning/bolt-forked-blue-yellow.webp"]];

        case 6: return [["poison"],["icons/magic/death/blood-corruption-vomit-red.webp"]];

        case 7: return [["psychic"],["icons/magic/perception/third-eye-blue-red.webp"]];
   
        case 8: return [["thunder"],["icons/magic/lightning/bolt-cloud-sky-green.webp"]];

        default: return "No value picked";  
    }
}
