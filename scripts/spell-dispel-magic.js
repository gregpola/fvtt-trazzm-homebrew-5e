/*
	Choose one creature, object, or magical effect within range. Any spell of 3rd level or lower on the target ends. For each spell of 4th level or higher on the target, make an ability check using your spellcasting ability. The DC equals 10 + the spell's level. On a successful check, the spell ends.

	At Higher Levels. When you cast this spell using a spell slot of 4th level or higher, you automatically end the effects of a spell on the target if the spell's level is equal to or less than the level of the spell slot you used.
*/
const version = "10.0.0";
const optionName = "Dispel Magic";
const lastArg = args[args.length - 1];

try {
	let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	let actorToken = canvas.tokens.get(lastArg.tokenId);

	if (args[0].macroPass === "postActiveEffects") {
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		const actorToken = canvas.tokens.get(lastArg.tokenId);
		const sourceItem = await fromUuid(lastArg.itemUuid);
		const spellLevel = lastArg.spellLevel;
		const spellcastingAbility = actor.system.attributes.spellcasting;
		const maxRange = sourceItem.system.range.value ? sourceItem.system.range.value : 120;
		
		// get the possible targets
		let possibleTargets = [];
		let position = await HomebrewMacros.warpgateCrosshairs(actorToken, maxRange, sourceItem);
		if (position) {
			const targetObjects = await canvas.tokens.placeables.filter(t => {
				const detectX = position.x.between(t.document.x, t.document.x + canvas.grid.size * t.document.width);
				const detectY = position.y.between(t.document.y, t.document.y + canvas.grid.size * t.document.height-1);
				return detectX && detectY;
			});
			
			// TODO look for templates
			
			if (targetObjects && (targetObjects.length > 0)) {
				for (const t of targetObjects) {
					possibleTargets.push(t);
				}
			}
		}
		else {
			return ui.notifications.error(`${optionName} - invalid dispel location`);
		}
		
		if (possibleTargets.length === 0) {
			return ui.notifications.error(`${optionName} - no targets at dispel location`);
		}
		
		// for now just dispel on the first target
		let targetToken = possibleTargets[0];
		let effects = targetToken.actor.effects.filter(e => e.origin);
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
					
					if (effect.label === "Concentrating") {
						concentrationEffects.set(effect.origin, {effectId: effect.id, level: level, label: effectSource.name});
					}
					else {
						otherEffects.push({origin: effect.origin, effectId: effect.id, level: level, label: effect.label});
					}
				}
			}				

			// build an array of effects to try to dispel
			let effectsToDispel = [];
			
			// first add in all concentration effects, because we know we have to process them
			for (let concentrationData of concentrationEffects.values()) {
				effectsToDispel.push(concentrationData);
			}
			
			// eliminate effects that are convered by a Concentration effect, 
			// since they will be covered by the dispel of the concentration effect
			for (let otherData of otherEffects) {
				if (!concentrationEffects.has(otherData.origin)) {
					effectsToDispel.push({effectId: otherData.effectId, level: otherData.level, label: otherData.label});
				}
			}
			
			// now go through and try to dispel the remaining effects
			for (let effectData of effectsToDispel) {
				let effect = targetToken.actor.effects.find(e => e.id === effectData.effectId);
				let removed = false;
				
				if (effectData.level <= spellLevel) {
					await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: targetToken.actor.uuid, effects: [effect.id] });
					await wait(200);
					removed = true;
				}
				else {
					let dc = 10 + effectData.level;
					let roll = await actor.rollAbilityTest(spellcastingAbility, {targetValue: dc});
					if (roll.total >= dc) {
						await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: targetToken.actor.uuid, effects: [effect.id] });
						await wait(200);
						removed = true;
					}
				}
				
				if (removed) {
					ChatMessage.create({
						content: `${actorToken.name} dispels ${effectData.label} from ${targetToken.name}`,
						speaker: ChatMessage.getSpeaker({ actor: actor })});						
				}
			}
		}		
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }