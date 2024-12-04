const version = "12.3.0";
const optionName = "Hunter's Mark Re-Mark";
const targetOptionName = "Hunter's Marked";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const targetFlagName = "hunters-mark-target";

try {
    if (args[0].macroPass === "preItemRoll") {
        let result = false;
        let oldTargetName;

        // make sure the current target is dead
        const targetFlag = actor.getFlag(_flagGroup, targetFlagName);
        if (targetFlag) {
            let target = await fromUuid(targetFlag.targetActorUuid);
            if (target) {
                if (target.system.attributes.hp.value > 0) {
                    oldTargetName = target.name;
                } else {
                    let oldEffect = target.effects.find(i => i.name === targetOptionName && i.origin === targetFlag.origin);
                    if (oldEffect) {
                        // TODO pull the remaining duration
                        await MidiQOL.socket().executeAsGM("removeEffects", {
                            actorUuid: target.uuid,
                            effects: [oldEffect.id]
                        });
                    }
                    result = true;
                }
            }
        }

        if (!result) {
            ChatMessage.create({
                content: `Unable to re-mark with Hunter's Mark - ${oldTargetName} is still alive`,
                speaker: ChatMessage.getSpeaker({actor: actor})
            });
        }

        return result;
    }
    else if (args[0].macroPass === "postActiveEffects") {
        let targetToken = workflow.targets?.first();
        if (targetToken) {
            const targetFlag = actor.getFlag(_flagGroup, targetFlagName);
            const huntersMarkItem = await fromUuid(targetFlag.origin);
            actor.setFlag(_flagGroup, targetFlagName, { targetActorUuid: targetToken.actor.uuid, origin: targetFlag.origin, duration: targetFlag.duration});

            // apply effect to the target
            let targetEffectData = {
                'name': targetOptionName,
                'icon': huntersMarkItem.img,
                'origin': targetFlag.origin,
                'duration': {
                    'seconds': targetFlag.duration
                },
                'flags': {'dae': {'specialDuration': ["zeroHP"]}}

            };
            await MidiQOL.socket().executeAsGM('createEffects', {
                'actorUuid': targetToken.actor.uuid,
                'effects': [targetEffectData]
            });
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
