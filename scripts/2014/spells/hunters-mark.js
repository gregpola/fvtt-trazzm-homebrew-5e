/*
	You choose a creature you can see within range and mystically mark it as your quarry. Until the spell ends, you deal
	an extra {@dice 1d6} damage to the target whenever you hit it with a weapon attack, and you have advantage on any
	Wisdom (Perception) or Wisdom (Survival) check you make to find it. If the target drops to 0 hit points before this
	spell ends, you can use a bonus action on a subsequent turn of yours to mark a new creature.

	At Higher Levels. When you cast this spell using a spell slot of 3rd or 4th level, you can maintain your
	concentration on the spell for up to 8 hours. When you use a spell slot of 5th level or higher, you can maintain your
	concentration on the spell for up to 24 hours.
 */
const version = "12.3.0";
const optionName = "Hunter's Mark";
const targetOptionName = "Hunter's Marked";
const targetFlagName = "hunters-mark-target";
const markNewTargetName = "Hunter's Mark - Mark New Target";

try {
	if (args[0].macroPass === "DamageBonus") {
		// only weapon attacks
		if (["mwak","rwak"].includes(workflow.item.system.actionType)) {
			let targetToken = workflow?.hitTargets?.first();
			if (targetToken) {
				const targetFlag = actor.getFlag(_flagGroup, targetFlagName);
				if (targetFlag) {
					let isMarked = targetToken.actor.effects.find(i => i.name === targetOptionName && i.origin === targetFlag.origin);
					if (isMarked) {
						const diceMult = workflow.isCritical ? 2: 1;
						let damageType = workflow.item.system.damage.parts[0][1];
						return {damageRoll: `${diceMult}d6[${damageType}]`, flavor: `${optionName} damage`};
					}
				}
			}
		}
	}
	else if (args[0].macroPass === "postActiveEffects") {
		// flag the target
		let targetActor = workflow?.targets?.first()?.actor;
		if (targetActor) {
			// get the actual duration
			const spellLevel = workflow.castData.castLevel;
			let durationMod = (spellLevel === 3 || spellLevel === 4) ? 8 : (spellLevel >= 5 ? 24 : 1);
			let duration = 3600 * durationMod;

			const huntersMarkEffect = HomebrewHelpers.findEffect(actor, item.name);
			const updatedDuration = deepClone(huntersMarkEffect.duration);
			updatedDuration.seconds = duration;
			await huntersMarkEffect.update({updatedDuration});

			actor.setFlag(_flagGroup, targetFlagName, {
				targetActorUuid: targetActor.uuid,
				origin: workflow.item.uuid,
				duration: duration
			});

			// apply effect to the target
			let targetEffectData = {
				'label': targetOptionName,
				'icon': workflow.item.img,
				'origin': workflow.item.uuid,
				'duration': {
					'seconds': duration
				},
				'flags': {'dae': {'specialDuration': ["zeroHP"]}}
			};
			await MidiQOL.socket().executeAsGM('createEffects', {
				'actorUuid': targetActor.uuid,
				'effects': [targetEffectData]
			});
		}
	}
	else if (args[0] === "on") {
		// add the move target item to the source actor
		let reMarkItem = await HomebrewHelpers.getItemFromCompendium('fvtt-trazzm-homebrew-5e.homebrew-automation-items', markNewTargetName);
		if (reMarkItem) {
			await actor.createEmbeddedDocuments("Item", [reMarkItem]);
			const actorItem = actor.items.find(i => i.name === markNewTargetName);
			await HomebrewHelpers.addFavorite(actor, actorItem);
		}
		else {
			ui.notifications.error(`${optionName}: ${version}: - unable to find ${markNewTargetName} in the compendium`);
		}
	}
	else if (args[0] === "off") {
		const moveTargetItem = actor.items.find(i => i.name === markNewTargetName);
		if (moveTargetItem) {
			moveTargetItem.delete();
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
    console.error(`${optionName}: ${version}`, err);
}
