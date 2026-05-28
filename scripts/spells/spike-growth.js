/*
	The ground in a 20-foot radius centered on a point within range twists and sprouts hard spikes and thorns. The area
	becomes difficult terrain for the Duration. When a creature moves into or within the area, it takes 2d4 piercing
	damage for every 5 feet it travels.

	The transformation of the ground is camouflaged to look natural. Any creature that can’t see the area at the time
	the spell is cast must make a Wisdom (Perception) check against your spell save DC to recognize the terrain as
	hazardous before entering it.

	The ground in a 20-foot-radius Sphere centered on a point within range sprouts hard spikes and thorns. The area
	becomes Difficult Terrain for the duration. When a creature moves into or within the area, it takes 2d4 Piercing
	damage for every 5 feet it travels.

	The transformation of the ground is camouflaged to look natural. Any creature that can’t see the area when the spell
	is cast must take a Search action and succeed on a Wisdom (Perception) or Wisdom (Survival) check against your spell
	save DC to recognize the terrain as hazardous before entering it.
*/
const version = "14.5.0";
const optionName = "Spike Growth";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _flagName = "spike-growth-data";
const inSpikesEffectName = "In Spike Growth";

try {
    if (args[0].macroPass === "postActiveEffects") {
    }
    else if (args[0] === "on") {
        const hookId = Hooks.on('moveToken', tokenMoved);
        await actor.setFlag(_flagGroup, _flagName, { hook: hookId });

    }
    else if (args[0] === "off") {
        let flag = actor.getFlag(_flagGroup, _flagName);
        if (flag) {
            Hooks.off('moveToken', flag.hook);
            await actor.unsetFlag(_flagGroup, _flagName);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function tokenMoved(token, movement, options, user) {
    if (token.actor) {
        // handle damage for each 5 feet moved
        const isFinished = await movement.finished;
        const spaces = movement.passed.spaces;
        const isTeleport = options.teleport;

        if (isFinished && !isTeleport) {
            // get the source item
            const effect = token.actor.effects.getName(inSpikesEffectName);
            if (effect) {
                const sourceEffect = await fromUuid(effect.flags["midi-qol"]?.regionSourceEffectUuid);
                if (sourceEffect) {
                    const sourceItem = await fromUuid(sourceEffect.origin);
                    if (sourceItem) {
                        for (let i=0; i < spaces; i++) {
                            await applyMoveDamage(token, sourceItem);
                        }
                    }
                }
            }
        }
    }
}

async function applyMoveDamage(targetToken, macroItem) {
    let activity = macroItem.system.activities.find(a => a.identifier === 'movement-damage');
    if (activity) {
        const options = {
            midiOptions: {
                targetsToUse: new Set([targetToken]),
                noOnUseMacro: false,
                configureDialog: false,
                showFullCard: false,
                ignoreUserTargets: true,
                checkGMStatus: true,
                autoRollAttack: true,
                autoRollDamage: "always",
                fastForwardAttack: true,
                fastForwardDamage: true,
                workflowData: false
            }
        };

        await MidiQOL.completeActivityUse(activity, options, {}, {});
    }
}
