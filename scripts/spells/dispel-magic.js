/*
    Choose one creature, object, or magical effect within range. Any ongoing spell of level 3 or lower on the target
    ends. For each ongoing spell of level 4 or higher on the target, make an ability check using your spellcasting
    ability (DC 10 plus that spell’s level). On a successful check, the spell ends.

    Using a Higher-Level Spell Slot. You automatically end a spell on the target if the spell’s level is equal to or
    less than the level of the spell slot you use.
 */
const version = "13.5.0";
const optionName = "Dispel Magic";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const spellLevel = workflow.castData.castLevel;
        const spellcastingAbility = actor.system.attributes.spellcasting;

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
                        const flavor = `${actor.name}'s Dispel Magic check (DC ${dc})`;
                        const config = { ability: spellcastingAbility, target: dc };
                        const dialog = { configure: true };
                        const message = { data: {
                                speaker: ChatMessage.implementation.getSpeaker({ actor: actor }),
                                flavor: flavor}};
                        let checkResult = await actor.rollAbilityCheck(config, dialog, message);
                        if (checkResult[0].isSuccess) {
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
