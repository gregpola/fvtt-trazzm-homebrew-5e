const version = "12.3.1";
const optionName = "Escape Grapple";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "grappler";

try {
    let grappledEffects = actor.getRollData().effects.filter(e => e.name.startsWith("Grappled ("));
    let bestSkill = actor.system.skills.acr.total > actor.system.skills.ath.total ? "acr" : "ath";

    if (grappledEffects && grappledEffects.length > 0) {
        if (grappledEffects.length === 1) {
            let grappledEffect = grappledEffects[0];
            let flag = grappledEffect.getFlag(_flagGroup, flagName);
            if (flag) {
                let grapplerToken = canvas.tokens.get(flag.grapplerId);
                await handleBreakAttempt(bestSkill, flag, grapplerToken, grappledEffect);
            }
        }
        else {
            // multiple grappled effects, ask which one to try to end
            let grappleData = [];
            let content = `<p>You are grappled by more than one character, select which one to break:</p>`;

            for (let grappledEffect of grappledEffects) {
                let flag = grappledEffect.getFlag(_flagGroup, flagName);
                let grapplerToken = canvas.tokens.get(flag.grapplerId);
                grappleData.push(`{ effect: ${grappledEffect}, flag: ${flag}, grappler: ${grapplerToken}`);
                content += `<label><input type="radio" name="choice" value="${grappledEffect.id}">  ${grapplerToken.name} </label>`;
            }

            let grappleToBreak = await foundry.applications.api.DialogV2.prompt({
                content: content,
                rejectClose: false,
                ok: {
                    callback: (event, button, dialog) => {
                        let effectId = button.form.elements.choice.value;
                        return grappleData.find(d => d.effect.id === effectId);
                    }
                },
                window: {
                    title: `${optionName}`
                },
                position: {
                    width: 400
                }
            });

            if (grappleToBreak) {
                await handleBreakAttempt(bestSkill, grappleToBreak.flag, grappleToBreak.grappler, grappleToBreak.effect);
            }
        }
    }
    else {
        ui.notifications.error(`${optionName}: the actor is not grappled`);
    }
} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}

async function handleBreakAttempt(bestSkill, flag, grapplerToken, grappledEffect) {
    if (flag.breakDC) {
        let rollDC = await actor.rollSkill(bestSkill);
        if (rollDC.total >= flag.breakDC) {
            await success(token, grapplerToken, grappledEffect, flag);
        } else {
            ChatMessage.create({
                content: `${actor.name} failed to escape the grapple`,
                speaker: ChatMessage.getSpeaker({actor: actor})
            });
        }

    } else if (grapplerToken) {
        await MidiQOL.contestedRoll({
            source: {token, rollType: "skill", ability: bestSkill},
            target: {token: grapplerToken, rollType: "skill", ability: "ath"},
            flavor: item.name,
            success: success.bind(this, token, grapplerToken, grappledEffect, flag),
            displayResults: true,
            itemCardId: workflow.itemCardId,
            rollOptions: {fastForward: false, chatMessage: true, rollMode: "gmroll"}
        });
    }
    else {
        ui.notifications.error(`${optionName}: ${version} - missing grappler or breakDC`);
        console.error(`${optionName}: ${version} - missing grappler or breakDC`);
    }
}

async function success(token, grappler, grappledEffect, flag, results) {
    await MidiQOL.socket().executeAsGM("removeEffects", {actorUuid: token.actor.uuid, effects: [grappledEffect.id]});

    // a flag, if any, that should be removed on the sourceToken if the condition is broken
    if (grappler && flag.sourceActorFlag) {
        await grappler.actor.unsetFlag(_flagGroup, flag.sourceActorFlag);
    }

    const grapplerName = grappler ? grappler.name : 'unknown';
    ChatMessage.create({
        content: `${token.name} escapes ${grapplerName}'s grapple!`,
        speaker: ChatMessage.getSpeaker({actor: token.actor})
    });
}
