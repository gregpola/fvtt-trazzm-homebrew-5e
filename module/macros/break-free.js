const version = "12.3.1";
const optionName = "Break Free";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "restrainer";

try {
    let restrainedEffects = actor.getRollData().effects.filter(e => e.name.startsWith("Restrained ("));
    let bestSkill = actor.system.skills.acr.total > actor.system.skills.ath.total ? "acr" : "ath";

    if (restrainedEffects && restrainedEffects.length > 0) {
        if (restrainedEffects.length === 1) {
            let restrainedEffect = restrainedEffects[0];
            let flag = restrainedEffect.getFlag(_flagGroup, flagName);
            if (flag) {
                let restrainerToken = canvas.tokens.get(flag.restrainerId);
                await handleBreakAttempt(bestSkill, flag, restrainerToken, restrainedEffect);
            }
        } else {
            // multiple restrained effects, ask which one to try to end
            let restrainData = [];
            let content = `<p>You are restrained by more than one character, select which one to break:</p>`;

            for (let restrainedEffect of restrainedEffects) {
                let flag = restrainedEffect.getFlag(_flagGroup, flagName);
                let restrainerToken = canvas.tokens.get(flag.restrainerId);
                restrainData.push(`{ effect: ${restrainedEffect}, flag: ${flag}, restrainer: ${restrainerToken}`);
                content += `<label><input type="radio" name="choice" value="${restrainedEffect.id}">  ${restrainerToken.name} </label>`;
            }

            let restrainedToBreak = await foundry.applications.api.DialogV2.prompt({
                content: content,
                rejectClose: false,
                ok: {
                    callback: (event, button, dialog) => {
                        let effectId = button.form.elements.choice.value;
                        return restrainData.find(d => d.effect.id === effectId);
                    }
                },
                window: {
                    title: `${optionName}`
                },
                position: {
                    width: 400
                }
            });

            if (restrainedToBreak) {
                await handleBreakAttempt(bestSkill, restrainedToBreak.flag, restrainedToBreak.restrainer, restrainedToBreak.effect);
            }
        }
    }
    else {
        ui.notifications.error(`${optionName}: the actor is not restrained`);
    }
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}

async function handleBreakAttempt(bestSkill, flag, restrainerToken, restrainedEffect) {
    if (flag.breakDC) {
        let rollDC = await actor.rollSkill(bestSkill);
        if (rollDC.total >= flag.breakDC) {
            await success(token, restrainerToken, restrainedEffect, flag);
        } else {
            ChatMessage.create({
                content: `${actor.name} failed to escape the hold`,
                speaker: ChatMessage.getSpeaker({actor: actor})
            });
        }

    } else if (restrainerToken) {
        await MidiQOL.contestedRoll({
            source: {token, rollType: "skill", ability: bestSkill},
            target: {token: restrainerToken, rollType: "skill", ability: "ath"},
            flavor: item.name,
            success: success.bind(this, token, restrainerToken, restrainedEffect, flag),
            displayResults: true,
            itemCardId: workflow.itemCardId,
            rollOptions: {fastForward: false, chatMessage: true, rollMode: "gmroll"}
        });
    }
    else {
        ui.notifications.error(`${optionName}: ${version} - missing restrainer or breakDC`);
        console.error(`${optionName}: ${version} - missing restrainer or breakDC`);
    }
}

async function success(token, restrainer, restrainedEffect, flag, results) {
    await MidiQOL.socket().executeAsGM("removeEffects", {actorUuid: token.actor.uuid, effects: [restrainedEffect.id]});

    // a flag, if any, that should be removed on the sourceToken if the condition is broken
    if (restrainer && flag.sourceActorFlag) {
        await restrainer.actor.unsetFlag(_flagGroup, flag.sourceActorFlag);
    }

    const restrainerName = restrainer ? restrainer.name : 'unknown';
    ChatMessage.create({
        content: `${token.name} escapes ${restrainerName}'s hold!`,
        speaker: ChatMessage.getSpeaker({actor: token.actor})
    });
}
