/**
 * An explosion then originates from the target. Each creature in a 60-foot Emanation originating from the target
 * (not including the target) makes a Dexterity saving throw, with Disadvantage if this spell reduced the target to
 * 0 Hit Points. A creature takes 10d10 damage on a failed save or half as much damage on a successful one.
 */
const optionName = "Detonate";
const version = "14.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        // check if the target was reduced to 0
        const targetToken = workflow.targets.first();
        if (targetToken) {
            // get the explosion targets
            let explosionTargets = MidiQOL.findNearby(null, targetToken, 60);
            if (explosionTargets && explosionTargets.length > 0) {
                if (targetToken.actor.system.attributes.hp.value === 0) {
                    explosionTargets.forEach(async (target) => {
                        await applyDisadvantage(target);
                    });
                }

                // trigger the explosion
                const targetUuids = Array.from(explosionTargets).map(t => t.document.uuid);
                const activity = macroItem.system.activities.getName("Explosion");
                if (activity) {
                    await MidiQOL.completeActivityUse(activity, { midiOptions: { targetUuids } });
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyDisadvantage(targetToken) {
    let effectData = {
        name: optionName,
        icon: item.img,
        origin: item.uuid,
        changes: [
            {
                key: 'flags.automated-conditions-5e.save.disadvantage',
                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value: 'once;',
                priority: 20
            }
        ],
        duration: {
        },
        flags: {
            dae: {
            }
        }
    };

    await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: targetToken.actor.uuid, effects: [effectData]});
}
