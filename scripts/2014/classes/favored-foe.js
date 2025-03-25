/*
	When you hit a creature with an attack roll, you can call on your mystical bond with nature to mark the target as
	your favored enemy for 1 minute or until you lose your concentration (as if you were concentrating on a spell).

	The first time on each of your turns that you hit the favored enemy and deal damage to it, including when you mark
	it, you can increase that damage by 1d4.

	You can use this feature to mark a favored enemy a number of times equal to your proficiency bonus, and you regain
	all expended uses when you finish a long rest.

	This feature’s extra damage increases when you reach certain levels in this class: to 1d6 at 6th level and to 1d8 at 14th level.
 */
const version = "12.3.0"
const optionName = "Favored Foe";
const marking = "Favored Foe Marked";
const timeFlag = "favored-foe-time";
const skipFlag = "favored-foe-skip";

try {
	if ((args[0].macroPass === "DamageBonus") && (workflow.hitTargets.size > 0)) {
		const targetToken = workflow.hitTargets.first();

		// make sure it's an allowed attack
		if (!["mwak", "rwak"].includes(workflow.item.system.actionType)) {
			console.log(`${optionName} - not an eligible attack`);
			return;
		}

		// Check for availability i.e. once per actors turn
		if (!HomebrewHelpers.isAvailableThisTurn(actor, timeFlag) || !game.combat || isSkipThisTurn()) {
			console.log(`${optionName} - not available this attack`);
			return;
		}

		// Check if the target is marked as a foe
		let targetMarkedEffect = targetToken.actor.getRollData().effects?.find(e => e.name === marking && e.origin === actor.uuid);
		if (!targetMarkedEffect) {
			// Isn't current marked as a foe, check if there are uses remaining
			let favoredFoeItem = actor.items?.find(a => a.name.toLowerCase() === "favored foe");
			if (favoredFoeItem) {
				const usesLeft = favoredFoeItem.system.uses?.value;
				if (usesLeft) {
					let content = `<div class="flexcol">
						<div class="flexrow"><p>Do you want to mark ${targetToken.name} as your ${optionName}?</p></div>
						<div class="flexrow" style="margin-bottom: 10px;"><p>(${usesLeft} uses remaining and requires concentration)</p></div>
					</div>`;

					const proceed = await foundry.applications.api.DialogV2.confirm({
						window: {
							title: `${optionName}`,
						},
						content: content,
						rejectClose: false,
						modal: true
					});

					if ( proceed ) {
						await decrementFavoredFoe(actor);
						targetMarkedEffect = await markAsFoe(actor, targetToken.actor);
						await MidiQOL.addConcentration(actor, {item: favoredFoeItem, targets: [targetToken]});
						let existingConcentration = MidiQOL.getConcentrationEffect(actor, favoredFoeItem);
						if (existingConcentration) {
							await MidiQOL.socket().executeAsGM('addDependent', {concentrationEffectUuid: existingConcentration.uuid, dependentUuid: targetMarkedEffect[0].uuid});
						}
					}
					else {
						await setSkipThisTurn();
					}
				}
			}
		}

		if (targetMarkedEffect) {
			await HomebrewHelpers.setUsedThisTurn(actor, timeFlag);

			const diceMult = workflow.isCritical ? 2: 1;
			const damageType = workflow.item.system.damage.parts[0][1];
			const levels = actor.getRollData().classes?.ranger?.levels ?? 0;

			if (levels > 13) {
				return {damageRoll: `${diceMult}d8[${damageType}]`, flavor: `${optionName} Damage`};
			}
			else if (levels > 5) {
				return {damageRoll: `${diceMult}d6[${damageType}]`, flavor: `${optionName} Damage`};
			}

			return {damageRoll: `${diceMult}d4[${damageType}]`, flavor: `${optionName} Damage`};
		}
	}

} catch (err) {
	console.error(`${optionName} - ${version}`, err);
}

function isSkipThisTurn() {
	if (game.combat) {
		const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
		const lastTime = actor.getFlag(_flagGroup, skipFlag);
		if (combatTime === lastTime) {
			console.log(`${optionName} - already chose to skip this turn`);
			return true;
		}
	}

	return false;
}

async function setSkipThisTurn() {
	const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
	const lastTime = actor.getFlag(_flagGroup, skipFlag);
	if (combatTime !== lastTime) {
		await actor.setFlag(_flagGroup, skipFlag, combatTime)
	}
}

// Decrement available resource
async function decrementFavoredFoe(testActor) {
	const featureItem = testActor.items?.find(a => a.name.toLowerCase() === "favored foe");
	if (featureItem) {
		const featureValue = featureItem.system.uses?.value ?? 1;
		await featureItem.update({ "system.uses.value": featureValue - 1 });
	}
}

async function markAsFoe(actor, targetActor) {
	const effectData = {
		name: `${marking}`,
		icon: "icons/skills/ranged/target-bullseye-arrow-glowing.webp",
		duration: {rounds: 10},
		origin: actor.uuid,
	}

	return await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetActor.uuid, effects: [effectData] });
}
