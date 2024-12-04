/*
	You place a curse on a creature that you can see within range. Until the spell ends, you deal an extra 1d6 necrotic
	damage to the target whenever you hit it with an attack. Also, choose one ability when you cast the spell. The target
	has disadvantage on ability checks made with the chosen ability.

	If the target drops to 0 hit points before this spell ends, you can use a bonus action on a subsequent turn of yours
	to curse a new creature.

	A remove curse cast on the target ends this spell early.

	*At Higher Levels. When you cast this spell using a spell slot of 3rd or 4th level, you can maintain your concentration
	on the spell for up to 8 hours. When you use a spell slot of 5th level or higher, you can maintain your concentration
	on the spell for up to 24 hours.
 */
const version = "12.3.1";
const optionName = "Hex";
const targetOptionName = "Hex Marked";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const targetFlagName = "hex-target";
const curseNewTargetName = "Hex - Curse New Target";

try {
	if (args[0].macroPass === "postActiveEffects") {
		// flag the target
		let targetActor = workflow?.targets?.first()?.actor;
		if (targetActor) {
			// get the actual duration
			const spellLevel = workflow.castData.castLevel;
			let durationMod = (spellLevel === 3 || spellLevel === 4) ? 8 : (spellLevel >= 5 ? 24 : 1);
			let duration = 3600 * durationMod;

			// Ask which ability they want to hex
			let ability = await HomebrewHelpers.selectAbilityDialog("Select Ability to Hex Curse");
			if (ability) {
				const hexEffect = HomebrewHelpers.findEffect(actor, item.name);
				const updatedDuration = deepClone(hexEffect.duration);
				updatedDuration.seconds = duration;
				await hexEffect.update({updatedDuration});

				actor.setFlag(_flagGroup, targetFlagName, { targetActorUuid: targetActor.uuid, origin: workflow.item.uuid, duration: duration});

				// Update concentration duration ??? update ???
				let concEffect = HomebrewHelpers.findEffect(actor, "Concentrating");
				if (concEffect) {
					const updatedConcDuration = deepClone(concEffect.duration);
					updatedConcDuration.seconds = duration;
					await concEffect.update({updatedConcDuration});
				}

				// apply effect to the target
				let effectData = {
					'name': targetOptionName,
					'icon': workflow.item.img,
					'origin': workflow.item.uuid,
					'duration': {
						'seconds': duration
					},
					'changes': [
						{
							key: `flags.midi-qol.disadvantage.ability.check.${ability}`,
							mode: 5,
							value: true,
							priority: 10
						}
					],
					'flags': { 'dae': { 'specialDuration': ["zeroHP"] } }
				};

				await MidiQOL.socket().executeAsGM('createEffects', {'actorUuid': targetActor.uuid, 'effects': [effectData]});
			}
		}
	}
	else if (args[0].macroPass === "DamageBonus") {
		// only attacks
		if (["mwak","rwak","msak","rsak"].includes(workflow.item.system.actionType)) {
			let targetToken = workflow?.hitTargets?.first();
			if (targetToken) {
				const targetFlag = actor.getFlag(_flagGroup, targetFlagName);
				if (targetFlag) {
					let isMarked = targetToken.actor.effects.find(i => i.name === targetOptionName && i.origin === targetFlag.origin);
					if (isMarked) {
						const diceMult = workflow.isCritical ? 2: 1;
						return {damageRoll: `${diceMult}d6[Necrotic]`, flavor: `${optionName} damage`};
					}
				}
			}
		}
	}
	else if (args[0] === "on") {
		// add the move target item to the source actor
		let recurseItem = await HomebrewHelpers.getItemFromCompendium('fvtt-trazzm-homebrew-5e.homebrew-automation-items', curseNewTargetName);
		if (recurseItem) {
			await actor.createEmbeddedDocuments("Item", [recurseItem]);
			const actorItem = actor.items.find(i => i.name === curseNewTargetName);
			await HomebrewHelpers.addFavorite(actor, actorItem);
		}
		else {
			ui.notifications.error(`${optionName}: ${version}: - unable to find ${curseNewTargetName} in the compendium`);
		}
	}
	else if (args[0] === "off") {
		const moveCurseItem = actor.items.find(i => i.name === curseNewTargetName);
		if (moveCurseItem) {
			moveCurseItem.delete();
		}

		const targetFlag = actor.getFlag(_flagGroup, targetFlagName);
		if (targetFlag) {
			await actor.unsetFlag(_flagGroup, targetFlagName);
			let targetActor = await fromUuid(targetFlag.targetActorUuid);
			if (targetActor) {
				let effect = targetActor.effects.find(i => i.name === targetOptionName && i.origin === targetFlag.origin);
				if (effect) {
					await MidiQOL.socket().executeAsGM('removeEffects', {'actorUuid':targetActor.uuid, 'effects': [effect.id]});
				}
			}
		}
	}

} catch (err) {
    console.error(`Hex spell ${version}`, err);
}
