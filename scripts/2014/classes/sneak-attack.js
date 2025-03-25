/*
	This version of sneak attack takes into consideration subclass features:
		* Rakish Audacity
		* Insightful Fighting
		* Versatile Sneak Attack feat

	Beginning at 1st level, you know how to strike subtly and exploit a foe's distraction. Once per turn, you can deal an
	extra 1d6 damage to one creature you hit with an attack if you have advantage on the attack roll. The attack must use
	a finesse or a ranged weapon.

	You don't need advantage on the attack roll if another enemy of the target is within 5 feet of it, that enemy isn't
	incapacitated, and you don't have disadvantage on the attack roll.

	The amount of the extra damage increases as you gain levels in this class, as shown in the Sneak Attack column of the Rogue table.
*/
const version = "12.3.0";
const optionName = "Sneak Attack";
const timeFlag = "sneakAttackTime";

const combatTime = game.combat ? `${game.combat.id}-${game.combat.round + game.combat.turn / 100}` : 1;

try {
	// Check the attack type
	if (!["mwak", "rwak"].includes(workflow.item.system.actionType)) {
		console.warn(`${optionName} - not valid action type`);
		return {};
	}

	if (!workflow.item.system.prof.hasProficiency) {
		console.warn(`${optionName} - ${actor.name} is not proficient with ${workflow.item.name}`);
		return {};
	}

	// check attack type for applicability
	let allowedWeapon = true;
	if (workflow.item.system.actionType === "mwak") {
		if (!workflow.item.system.properties.has('fin')) {
			allowedWeapon = false;
			if (workflow.item.system.properties.has('ver') && checkVersatileSneakAttack(token)) {
				allowedWeapon = true;
			}
		}
	}

	if (!allowedWeapon) {
		console.debug(`${optionName} - ${workflow.item.name} is not an allowed weapon`);
		return {};
	}

	// check for sneak attack dice
	let sneakDice = actor.system.scale?.rogue['sneak-attack']?.formula;
	if (!sneakDice) {
		if (actor.type === "npc") {
			const diceCount = Math.ceil(actor.system.details.cr / 2);
			sneakDice = `${diceCount}d6`;
		}
	}

	if (!sneakDice) {
		console.debug(`${optionName} - no rogue levels`);
		return {};
	}

	let targetToken = workflow.hitTargets.first();
	if (!targetToken) {
		console.error(`${optionName} - no target token`);
		return {};
	}

	// check once per turn
	if (HomebrewHelpers.isAvailableThisTurn(actor, timeFlag) && game.combat) {
		// Determine if the attack is eligible for Sneak Attack
		let isSneak = workflow.advantage;

		if (!isSneak && checkAllyNearTarget(token, targetToken)) {
			// adjacent enemy
			isSneak = !workflow.disadvantage;
		}

		if (!isSneak && !workflow.disadvantage) {
			isSneak = checkRakishAudacity(token, targetToken);
		}

		if (!isSneak && !workflow.disadvantage) {
			isSneak = checkInsightfulFighting(token, targetToken);
		}

		if (!isSneak) {
			console.debug(`${optionName} - attack not eligible for sneak attack`);
			return {};
		}

		// ask if they want to apply sneak attack
		let useSneak = await foundry.applications.api.DialogV2.confirm({
			window: {
				title: `${optionName}`,
			},
			content: `<p>Use Sneak attack on this attack? [${sneakDice}]</p>`,
			rejectClose: false,
			modal: true
		});

		// Apply the damage
		if (useSneak) {
			await HomebrewHelpers.setUsedThisTurn(actor, timeFlag);
			if (workflow.isCritical) {
				const critRoll = await new Roll(sneakDice).evaluate({maximize: true});
				return {damageRoll: `${sneakDice} + ${critRoll.total}`, flavor: optionName};
			}
			else
				return {damageRoll: `${sneakDice}`, flavor: optionName};
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

// Check if there is an enemy of the target adjacent to it
function checkAllyNearTarget(rogueToken, targetToken) {
	let foundEnemy = false;
	let nearbyEnemy = canvas.tokens.placeables.filter(t => {
		let nearby = (t.actor &&
			t.actor?.id !== rogueToken.actor._id && // not me
			t.id !== targetToken.id && // not the target
			t.actor?.system.attributes?.hp?.value > 0 && // not incapacitated
			t.document.disposition !== targetToken.document.disposition && // not an ally
			MidiQOL.getDistance(t, targetToken, false) <= 5 // close to the target
		);
		foundEnemy = foundEnemy || (nearby && t.document.disposition === -targetToken.document.disposition)
		return nearby;
	});
	return (nearbyEnemy.length > 0);
}

function checkRakishAudacity(rogueToken, targetToken) {
	let featureItem = rogueToken.actor.items.getName("Rakish Audacity");
	let rakish = false;
	if (featureItem) {
		let totalNearbyToMe = MidiQOL.findNearby(null, rogueToken, 5).length;
		let distanceToTarget = MidiQOL.getDistance(targetToken, rogueToken, false);
		rakish = ((totalNearbyToMe === 1) && (distanceToTarget <= 5));
	}

	return rakish;
}

function checkInsightfulFighting(rogueToken, targetToken) {
	const effect = findEffect(rogueToken.actor, "Insightful Fighting", rogueToken.actor.uuid);
	if (effect)
		return true;
	return false;
}

function checkVersatileSneakAttack(rogueToken) {
	const effect = findEffect(rogueToken.actor, "Versatile Sneak Attack", rogueToken.actor.uuid);
	if (effect)
		return true;
	return false;
}

function findEffect(actor, effectName, origin) {
    let effectUuid = null;
    effectUuid = actor?.getRollData().effects?.find(ef => ef.name === effectName && ef.origin === origin);
    return effectUuid;
}
