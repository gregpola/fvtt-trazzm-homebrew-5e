/*
    For the spell’s duration, your tongue becomes an elongated tether of necrotic green energy you can use to drink the
    vitality of other creatures. One creature of your choice within 60 feet of you that you can see must make a
    Constitution saving throw. On a failed save, the target gains 1 level of exhaustion, and you regain hit points equal
    to 1d4 + your spellcasting ability modifier.

    On each of your turns until the spell ends, you can use your action to target the same creature or a different one,
    but can’t target a creature again if it has succeeded on a saving throw against this casting of stream of consumption.
*/
const optionName = "Stream of Consumption";
const version = "13.5.0";
const savedEffectName = "Saved (Stream of Consumption)";

try {
    // target confirmation that they have not saved
    if (args[0].macroPass === "prePreambleComplete") {
        let targetToken = workflow.targets.first();
        if (targetToken) {
            const effect = HomebrewHelpers.findEffect(targetToken.actor, savedEffectName);
            if (effect) {
                ui.notifications.error(`${optionName}: ${version} - failed because that target has already saved`);
                workflow.aborted = true;
            }
        }

    }
    else if (args[0].macroPass === "postActiveEffects") {
        let targetToken = workflow.failedSaves.first();
        if (targetToken) {
            let currentExhaustion = targetToken.actor.system.attributes.exhaustion ?? 0;
            await targetToken.actor.update({"system.attributes.exhaustion": currentExhaustion + 1});

            const healRoll = await new Roll(`1d4 + ${actor.system.attributes.spell.mod}`).evaluate();
            await actor.applyDamage(- healRoll.total);
            await ChatMessage.create({
                content: `${actor.name} steals ${healRoll.total} hit points`,
                speaker: ChatMessage.getSpeaker({ actor: actor })});
        }
        else {
            targetToken = workflow.saves.first();
            if (targetToken) {
                await applySavedEffect(targetToken.actor, macroItem);
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applySavedEffect(actor, item) {
    const savedEffect = {
        name: savedEffectName,
        transfer: false,
        img: "icons/magic/defensive/shield-barrier-blue.webp",
        origin: item.uuid,
        type: "base",
        changes: [
        ],
        disabled: false,
        flags: {
            dae: {
                showIcon: true,
                stackable: 'noneName',
                specialDuration: [
                    'endCombat', 'shortRest'
                ]
            }
        }
    };

    await MidiQOL.createEffects({ actorUuid: actor.uuid, effects: [savedEffect] });
}
