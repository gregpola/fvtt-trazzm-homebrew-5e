const version = "11.3";
const optionName = "Maul of Squeamishness";

try {
    if (args[0].macroPass === "postActiveEffects") {
        if (workflow.hitTargets.size > 0) {
            if (workflow.isCritical) {
                let healRoll = await new Roll('1d8').roll();
                await game.dice3d?.showForRoll(healRoll);

                await ChatMessage.create({content: "Marge's Maul - critical healing"});
                await MidiQOL.applyTokenDamage([{
                    type: 'healing',
                    damage: healRoll.total
                }], healRoll.total, new Set([token]), item, new Set(), {forceApply: false});
            }

            // ask wielder if they want to knock the target prone
            let targetToken = workflow.hitTargets.first();
            const targetIsProne = await game.dfreds.effectInterface.hasEffectApplied('Prone', targetToken.actor.uuid);
            if (!targetIsProne) {
                let dialog = new Promise((resolve, reject) => {
                    new Dialog({
                        // localize this text
                        title: 'Topple',
                        content: `<p>Do you want to knock ${targetToken.name} prone?</p>`,
                        buttons: {
                            one: {
                                icon: '<p><img src = "icons/equipment/feet/boots-collared-simple-brown.webp" width="50" height="50"></></p>',
                                label: "<p>Yes</p>",
                                callback: () => resolve(true)
                            },
                            two: {
                                icon: '<p><img src = "icons/skills/melee/weapons-crossed-swords-yellow.webp" width="50" height="50"></></p>',
                                label: "<p>No</p>",
                                callback: () => {
                                    resolve(false)
                                }
                            }
                        },
                        default: "two"
                    }).render(true);
                });

                let useTopple = await dialog;
                if (useTopple) {
                    const saveDC = 8 + actor.system.attributes.prof + actor.system.abilities.str.mod;
                    const actorName = actor.name;
                    const targetName = targetToken.name;
                    const targetActorUuid = targetToken.actor.uuid;
                    let saveFlavor = `${CONFIG.DND5E.abilities["con"].label} DC${saveDC} ${optionName}`;

                    let saveRoll = await targetToken.actor.rollAbilitySave("con", {flavor: saveFlavor, damageType: "poison"});
                    await game.dice3d?.showForRoll(saveRoll);

                    if (saveRoll.total < saveDC) {
                        ChatMessage.create({'content': `${actorName} knocks ${targetName} prone!`});
                        await game.dfreds.effectInterface.addEffect({ effectName: 'Prone', uuid: targetActorUuid });
                    }
                }
            }
        }
    }
} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}