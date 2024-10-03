const version = "12.3.0";
const optionName = "Break Free";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "restrainer";

try {
    let restrainedEffect = actor.effects.find(e => e.name.startsWith("Restrained ("));
    if (restrainedEffect) {
        let flag = restrainedEffect.getFlag(_flagGroup, flagName);
        if (flag) {
            let bestSkill = actor.system.skills.acr.total > actor.system.skills.ath.total ? "acr" : "ath";
            let restrainer = canvas.tokens.get(flag.restrainerId);

            if (restrainer) {
                if (flag.saveDC) {
                    let rollDC = await actor.rollSkill(bestSkill);
                    if (rollDC.total >= flag.saveDC) {
                        await success(token, restrainer, restrainedEffect, flag);
                    } else {
                        ChatMessage.create({'content': `${actor.name} failed to break free`});
                    }
                } else {
                    await MidiQOL.contestedRoll({
                        source: {token, rollType: "skill", ability: bestSkill},
                        target: {token: restrainer, rollType: "skill", ability: "ath"},
                        flavor: item.name, success: success.bind(this, token, restrainer, restrainedEffect, flag), displayResults: true, itemCardId: workflow.itemCardId,
                        rollOptions: {fastForward: false, chatMessage: true, rollMode: "gmroll"}
                    });
                }
            }
            else {
                ui.notifications.error(`${optionName}: no restrainer found`);
            }
        }
        else {
            // else -- something is wrong
            ui.notifications.error(`${optionName}: no restrainer flag found`);
        }
    }
    else {
        ui.notifications.error(`${optionName}: the actor is not restrained`);
    }
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}

async function success(token, restrainer, restrainedEffect, flag, results) {
    await restrainedEffect.delete();

    // a flag, if any, that should be removed on the sourceToken if the condition is broken
    if (flag.sourceActorFlag) {
        await restrainer.actor.unsetFlag(_flagGroup, flag.sourceActorFlag);
    }

    ChatMessage.create({'content': `${token.name} breaks free!`});
}