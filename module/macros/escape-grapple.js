const version = "12.3.0";
const optionName = "Escape Grapple";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "grappler";

try {
    let grappledEffect = actor.effects.find(e => e.name.startsWith("Grappled ("));
    if (grappledEffect) {
        let flag = grappledEffect.getFlag(_flagGroup, flagName);
        if (flag) {
            let bestSkill = actor.system.skills.acr.total > actor.system.skills.ath.total ? "acr" : "ath";
            let grappler = canvas.tokens.get(flag.grapplerId);

            if (grappler) {
                if (flag.saveDC) {
                    let rollDC = await actor.rollSkill(bestSkill);
                    if (rollDC.total >= flag.saveDC) {
                        await success(token, grappler, grappledEffect, flag);
                    } else {
                        ChatMessage.create({'content': `${actor.name} failed to escape the grapple `});
                    }
                } else {
                    await MidiQOL.contestedRoll({
                        source: {token, rollType: "skill", ability: bestSkill},
                        target: {token: grappler, rollType: "skill", ability: "ath"},
                        flavor: item.name, success: success.bind(this, token, grappler, grappledEffect, flag), displayResults: true, itemCardId: workflow.itemCardId,
                        rollOptions: {fastForward: false, chatMessage: true, rollMode: "gmroll"}
                    });
                }
            }
            else {
                ui.notifications.error(`${optionName}: no grappler found`);
            }
        }
        else {
            // else -- something is wrong
            ui.notifications.error(`${optionName}: no grappler flag found`);
        }
    }
    else {
        ui.notifications.error(`${optionName}: the actor is not grappled`);
    }
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}

async function success(token, grappler, grappledEffect, flag, results) {
    await grappledEffect.delete();

    // a flag, if any, that should be removed on the sourceToken if the condition is broken
    if (flag.sourceActorFlag) {
        await grappler.actor.unsetFlag(_flagGroup, flag.sourceActorFlag);
    }

    ChatMessage.create({'content': `${token.name} escapes the grapple!`});
}