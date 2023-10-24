const version = "11.0";
const optionName = "Hunter's Mark Re-Mark";
const targetOptionName = "Hunter's Marked";
const targetFlagName = "hunters-mark-target";

try {
    if (args[0].macroPass === "preItemRoll") {
        let result = true;
        let oldEffect;
        let oldTargetName;

        // make sure the current target is dead
        const targetFlag = actor.getFlag("world", targetFlagName);
        if (targetFlag) {
            let oldTarget = await fromUuid(targetFlag.targetId);

            if (oldTarget) {
                if (oldTarget.system.attributes.hp.value > 0) {
                    result = false;
                    oldTargetName = oldTarget.name;
                }
                else {
                    oldEffect = oldTarget.effects.find(i => i.name === targetOptionName && i.origin === targetFlag.origin);
                    if (oldEffect) {
                        await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: oldTarget.uuid, effects: [oldEffect.id] });
                    }
                }
            }
        }

        let targetActor = workflow?.targets?.first()?.actor;
        if (targetActor && result) {
            actor.setFlag("world", targetFlagName, { targetId: targetActor.uuid, origin: targetFlag.origin});

            // apply effect to the target
            let targetEffectData = {
                'name': targetOptionName,
                'icon': workflow.item.img,
                'origin': targetFlag.origin,
                'duration': {
                    'seconds': 3600
                },
                'flags': { 'dae': { 'specialDuration': ["zeroHP"] } }

            };
            await MidiQOL.socket().executeAsGM('createEffects', {'actorUuid': targetActor.uuid, 'effects': [targetEffectData]});
        }

        if (!result) {
            ChatMessage.create({
                content: `Unable to re-apply Hunter's Mark - ${oldTargetName} is still alive`,
                speaker: ChatMessage.getSpeaker({ actor: actor })});
        }

        return result;
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
