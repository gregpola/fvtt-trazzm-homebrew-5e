const version = "12.3.0";
const optionName = "Tacticians Gambit";

try {
    let targetToken = workflow.hitTargets.first();
    if (args[0].macroPass === "DamageBonus" && targetToken) {
        // make sure the actor has charges remaining
        let usesLeft = macroItem.system.uses?.value ?? 0;
        if (!usesLeft) {
            console.info(`${macroItem.name} - no uses left`);
            return {};
        }

        if (usesLeft) {
            const content = `<p>Do you want to use a special ability? (${usesLeft} uses remaining)</p>
						<label style="margin-right: 10px; margin-bottom: 10px;"><input type="radio" name="choice" value="no" checked>   No </label>
						<label style="margin-right: 10px; margin-bottom: 10px;"><input type="radio" name="choice" value="distract" >   Distracting Strike </label>
						<label style="margin-right: 10px; margin-bottom: 10px;"><input type="radio" name="choice" value="trip">  Trip Attack </label>
						<label style="margin-right: 10px; margin-bottom: 10px;"><input type="radio" name="choice" value="goad">   Goading Attack </label>`;

            let optionPicked = await foundry.applications.api.DialogV2.prompt({
                content: content,
                rejectClose: false,
                ok: {
                    callback: (event, button, dialog) => {
                        return button.form.elements.choice.value;
                    }
                },
                window: {
                    title: `${optionName}`,
                },
                position: {
                    width: 400
                }
            });

            const abilityBonus = Math.max(actor.system.abilities.str.mod, actor.system.abilities.dex.mod);
            const saveDC = 8 + actor.system.attributes.prof + abilityBonus;

            if (optionPicked === 'distract') {
                // pay the cost
                const newValue = usesLeft - 1;
                await macroItem.update({"system.uses.value": newValue});

                await markGrantsAdvantage(targetToken.actor.uuid);
                ChatMessage.create({
                    content: `${optionName} - ${targetToken.name} is distracted by ${actor.name}`,
                    speaker: ChatMessage.getSpeaker({actor: actor})
                });

            }
            else if (optionPicked === 'trip') {
                // pay the cost
                const newValue = usesLeft - 1;
                await macroItem.update({"system.uses.value": newValue});

                // roll save for target
                const saveFlavor = `${CONFIG.DND5E.abilities["str"].label} DC${saveDC} ${optionName}`;
                let saveRoll = await targetToken.actor.rollAbilitySave("str", {flavor: saveFlavor, damageType: "prone"});
                if (saveRoll.total < saveDC) {
                    await HomebrewEffects.applyProneEffect(targetToken.actor, macroItem );
                    ChatMessage.create({
                        content: `${actor.name} trips ${targetToken.name}`,
                        speaker: ChatMessage.getSpeaker({actor: actor})
                    });
                }
            }
            else if (optionPicked === 'goad') {
                // pay the cost
                const newValue = usesLeft - 1;
                await macroItem.update({"system.uses.value": newValue});

                // roll save for target
                const saveFlavor = `${CONFIG.DND5E.abilities["wis"].label} DC${saveDC} ${optionName}`;
                let saveRoll = await targetToken.actor.rollAbilitySave("wis", {flavor: saveFlavor});
                if (saveRoll.total < saveDC) {
                    await markAsGoaded(targetToken.actor.uuid, macroItem, token.id);
                    ChatMessage.create({
                        content: `${targetToken.name} is goaded by ${actor.name}`,
                        speaker: ChatMessage.getSpeaker({actor: actor})
                    });

                }
            }
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function markGrantsAdvantage(targetId) {
    const effectData = {
        name: `${optionName} - Distracted`,
        icon: "icons/magic/control/hypnosis-mesmerism-eye-tan.webp",
        origin: macroItem.uuid,
        changes: [
            {
                key: 'flags.midi-qol.grants.advantage.attack.all',
                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value: 'workflow.token.id != "' + workflow.token.id + '"',
                priority: 20
            },
            {
                key: 'flags.midi-qol.onUseMacroName',
                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value: 'function.HomebrewMacros.handleDistractingStrike, isAttacked',
                priority: 21
            }
        ],
        duration: {
        },
        flags: {
            dae: {
                specialDuration: [
                    "turnStartSource"
                ]
            }
        },
        disabled: false
    };

    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetId, effects: [effectData] });
}
