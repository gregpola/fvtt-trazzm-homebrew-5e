const version = "12.3.2";
const optionName = "Break Free";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const escapeName = "restrained-escape-dc";
const skillName = "restrained-escape-skill";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let restrainedEffects = actor.getRollData().effects.filter(e => e.name === 'Restrained' && e.origin);
        let bestSkill = actor.system.skills.acr.total > actor.system.skills.ath.total ? "acr" : "ath";

        if (restrainedEffects && restrainedEffects.length > 0) {
            if (restrainedEffects.length === 1) {
                let restrainedEffect = restrainedEffects[0];
                const sourceItem = await fromUuid(restrainedEffect.origin);
                let restrainerToken = sourceItem.actor;

                let escapeSkill = restrainedEffect.getFlag(_flagGroup, skillName);
                if (!escapeSkill) {
                    escapeSkill = bestSkill;
                }

                await handleBreakAttempt(escapeSkill, restrainerToken, restrainedEffect);

            } else {
                // multiple restrained effects, ask which one to try to end
                let restrainData = [];
                let content = `<p>You are restrained by more than one character, select which one to break:</p>`;

                for (let restrainedEffect of restrainedEffects) {
                    const sourceItem = await fromUuid(restrainedEffect.origin);
                    let restrainerToken = sourceItem.actor;
                    restrainData.push(`{ effect: ${restrainedEffect}, restrainer: ${restrainerToken}`);
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
                    let escapeSkill = restrainedToBreak.effect.getFlag(_flagGroup, skillName);
                    if (!escapeSkill) {
                        escapeSkill = bestSkill;
                    }
                    await handleBreakAttempt(escapeSkill, restrainedToBreak.restrainer, restrainedToBreak.effect);
                }
            }
        } else {
            ui.notifications.error(`${optionName}: the actor is not restrained`);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function handleBreakAttempt(escapeSkill, restrainerToken, restrainedEffect) {
    let escapeDC = restrainedEffect.getFlag(_flagGroup, escapeName);

    if (escapeDC) {
        let result = await HomebrewHelpers.rollAbilityCheck(actor, escapeSkill);
        if (result >= escapeDC) {
            await success(token, restrainerToken, restrainedEffect);
        } else {
            ChatMessage.create({
                content: `${actor.name} failed to escape the hold`,
                speaker: ChatMessage.getSpeaker({actor: actor})
            });
        }

    } else if (restrainerToken) {
        await MidiQOL.contestedRoll({
            source: {token, rollType: "skill", ability: escapeSkill},
            target: {token: restrainerToken, rollType: "skill", ability: "ath"},
            flavor: item.name,
            success: success.bind(this, token, restrainerToken, restrainedEffect),
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

async function success(token, restrainer, restrainedEffect) {
    await MidiQOL.socket().executeAsGM("removeEffects", {actorUuid: token.actor.uuid, effects: [restrainedEffect.id]});
    const restrainerName = restrainer ? restrainer.name : 'unknown';
    ChatMessage.create({
        content: `${token.name} escapes ${restrainerName}'s hold!`,
        speaker: ChatMessage.getSpeaker({actor: token.actor})
    });
}
