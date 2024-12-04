const version = "12.3.2";
const optionName = "Escape Grapple";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "grapple-escape-dc";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let grappledEffects = actor.getRollData().effects.filter(e => e.name === 'Grappled' && e.origin);
        let bestSkill = actor.system.skills.acr.total > actor.system.skills.ath.total ? "acr" : "ath";

        if (grappledEffects && grappledEffects.length > 0) {
            if (grappledEffects.length === 1) {
                let grappledEffect = grappledEffects[0];
                let escapeDC = grappledEffect.getFlag(_flagGroup, flagName);
                const sourceItem = await fromUuid(grappledEffect.origin);
                let grapplerToken = sourceItem.actor;
                await handleBreakAttempt(bestSkill, escapeDC, grapplerToken, grappledEffect);
            } else {
                // multiple grappled effects, ask which one to try to end
                let grappleData = [];
                let content = `<p>You are grappled by more than one character, select which one to break:</p>`;

                for (let grappledEffect of grappledEffects) {
                    const sourceItem = await fromUuid(grappledEffect.origin);
                    let grapplerToken = sourceItem.actor;
                    grappleData.push(`{ effect: ${grappledEffect}, grappler: ${grapplerToken}`);
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
                    let escapeDC = grappleToBreak.effect.getFlag(_flagGroup, flagName);
                    await handleBreakAttempt(bestSkill, escapeDC, grappleToBreak.grappler, grappleToBreak.effect);
                }
            }
        } else {
            ui.notifications.error(`${optionName}: the actor is not grappled`);
        }
    }
} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}

async function handleBreakAttempt(bestSkill, escapeDC, grapplerToken, grappledEffect) {
    if (escapeDC) {
        let rollDC = await actor.rollSkill(bestSkill);
        if (rollDC.total >= escapeDC) {
            await success(token, grapplerToken, grappledEffect);
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
            success: success.bind(this, token, grapplerToken, grappledEffect),
            displayResults: true,
            itemCardId: workflow.itemCardId,
            rollOptions: {fastForward: false, chatMessage: true, rollMode: "gmroll"}
        });
    }
    else {
        ui.notifications.error(`${optionName}: ${version} - missing grappler or escapeDC`);
        console.error(`${optionName}: ${version} - missing grappler or escapeDC`);
    }
}

async function success(token, grappler, grappledEffect) {
    const grapplerName = grappler ? grappler.name : 'unknown';
    ChatMessage.create({
        content: `${token.name} escapes ${grapplerName}'s grapple!`,
        speaker: ChatMessage.getSpeaker({actor: token.actor})
    });

    await MidiQOL.socket().executeAsGM("removeEffects", {actorUuid: token.actor.uuid, effects: [grappledEffect.id]});
}
