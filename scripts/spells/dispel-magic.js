/*
	Choose one creature, object, or magical effect within range. Any spell of 3rd level or lower on the target ends. For
	each spell of 4th level or higher on the target, make an ability check using your spellcasting ability. The DC
	equals 10 + the spell's level. On a successful check, the spell ends.

	At Higher Levels. When you cast this spell using a spell slot of 4th level or higher, you automatically end the
	effects of a spell on the target if the spell's level is equal to or less than the level of the spell slot you used.
*/
const version = "12.3.0";
const optionName = "Dispel Magic";

try {
	if (args[0].macroPass === "postActiveEffects") {
		const spellLevel = workflow.castData.castLevel;
		const spellcastingAbility = actor.system.attributes.spellcasting;
		//const maxRange = item.system.range.value ? item.system.range.value : 120;

		// for now just dispel on the first target
		const targetToken = workflow.targets.first();
		if (targetToken) {
			let effects = targetToken.actor.getRollData().effects.filter(e => e.origin);
			if (effects && effects.length > 0) {
				let concentrationEffects = new Map();
				let otherEffects = [];

				// gather effect data
				// first go through and eliminate effects that are convered by a Concentration effect,
				// since they will be covered by the dispel of the concentration effect
				for (let effect of effects) {
					const effectSource = await fromUuid(effect.origin);
					if (effectSource && effectSource.type === "spell") {
						let level = effectSource.system.level;

						if (effect.name === "Concentrating") {
							concentrationEffects.set(effect.origin, {effectId: effect.id, level: level, name: effectSource.name});
						}
						else {
							otherEffects.push({origin: effect.origin, effectId: effect.id, level: level, name: effect.name});
						}
					}
				}

				// build an array of effects to try to dispel
				let effectsToDispel = [];

				// first add in all concentration effects, because we know we have to process them
				for (let concentrationData of concentrationEffects.values()) {
					effectsToDispel.push(concentrationData);
				}

				// eliminate effects that are covered by a Concentration effect,
				// since they will be covered by the dispel of the concentration effect
				for (let otherData of otherEffects) {
					if (!concentrationEffects.has(otherData.origin)) {
						effectsToDispel.push({effectId: otherData.effectId, level: otherData.level, name: otherData.name});
					}
				}

				// now go through and try to dispel the remaining effects
				for (let effectData of effectsToDispel) {
					let effect = targetToken.actor.effects.find(e => e.id === effectData.effectId);
					let removed = false;

					if (effectData.level <= spellLevel) {
						await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: targetToken.actor.uuid, effects: [effect.id] });
						await HomebrewMacros.wait(200);
						removed = true;
					}
					else {
						let dc = 10 + effectData.level;
						let roll = await actor.rollAbilityTest(spellcastingAbility, {targetValue: dc});
						if (roll.total >= dc) {
							await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: targetToken.actor.uuid, effects: [effect.id] });
							await HomebrewMacros.wait(200);
							removed = true;
						}
					}

					if (removed) {
						ChatMessage.create({
							content: `${token.name} dispels ${effectData.name} from ${targetToken.name}`,
							speaker: ChatMessage.getSpeaker({ actor: actor })});
					}
				}
			}
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
