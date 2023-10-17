/*
    Each non-undead creature within 60 feet of the ghost that can see it must succeed on a DC 13 Wisdom saving throw or
    be frightened for 1 minute. If the save fails by 5 or more, the target also ages 1d4 × 10 years. A frightened target
    can repeat the saving throw at the end of each of its turns, ending the frightened condition on itself on a success.
    If a target's saving throw is successful or the effect ends for it, the target is immune to this ghost's Horrifying
    Visage for the next 24 hours. The aging effect can be reversed with a greater restoration spell, but only within 24
    hours of it occurring.
 */
const version = "10.0";
const optionName = "Horrifying Visage";

try {
    const lastArg = args[args.length - 1];

    if (lastArg.macroPass === "preambleComplete") {

        // check target types
        for (let target of lastArg.workflow.targets) {
            let creatureType = target.actor.system.details.type;

            // remove targets that are undead
            if ((creatureType != null) && (creatureType.value === "undead")) {
                lastArg.workflow.targets.delete(target);
            }
        }

        game.user.updateTokenTargets(Array.from(lastArg.workflow.targets).map(t => t.id));

    } else if (lastArg.macroPass === "postSave") {
        let targets = lastArg.failedSaves;

        if (targets && targets.length > 0) {
            let saveDC = lastArg.itemData.system.save.dc;

            for (let target of targets) {
                let targetIndex = lastArg.targets.indexOf(target);
                let targetResult = lastArg.workflow.saveResults[targetIndex].total ?? 0;

                // compare the same result to the DC to determine if they should be aged
                if (targetResult < (saveDC - 4)) {
                    let ageRoll = await new Roll("1d4").roll({async: true});
                    let ageYears = ageRoll.result * 10;

                    ChatMessage.create({
                        content: `${target.actor.name} is aged ${ageYears} years!`,
                        speaker: ChatMessage.getSpeaker({ actor: actor })});
                }

                // Apply Frightened effect (overtime)
                const effectData = {
                    label: `${optionName}`,
                    icon: lastArg.item.img,
                    origin: actor.uuid,
                    duration: {startTime: game.time.worldTime, seconds: 60},
                    changes: [
                        {
                            key: `flags.midi-qol.OverTime`,
                            mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                            value: `turn=end, label=Frightened, saveDC=${saveDC}, saveAbility=wis`,
                            priority: 20
                        },
                        {
                            key: 'macro.CE',
                            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                            value: "Frightened",
                            priority: 21
                        }
                    ],
                    transfer: false,
                    disabled: false
                };

                await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.actor.uuid, effects: [effectData] });
            }
        }
        else {
            console.log("No targets failed their save");
        }
    }
} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}
