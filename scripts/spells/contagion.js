/*
    Your touch inflicts disease. Make a melee spell attack against a creature within your reach. On a hit, you afflict
    the creature with a disease of your choice from any of the ones described below.

    At the end of each of the target’s turns, it must make a Constitution saving throw. After failing three of these
    saving throws, the disease’s effects last for the duration, and the creature stops making these saves. After
    succeeding on three of these saving throws, the creature recovers from the disease, and the spell ends.

    Since this spell induces a natural disease in its target, any effect that removes a disease or otherwise ameliorates
    a disease’s effects apply to it.
*/
const version = "12.3.0";
const optionName = "Contagion";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "contagion-status";

try {
    if (args[0].macroPass === "postActiveEffects" && (workflow.hitTargets.size > 0)) {
        // ask which type of disease
        let content = `
            <label><input type="radio" name="choice" value="blinding" checked>  Blinding Sickness </label>
            <label><input type="radio" name="choice" value="fever">  Filth Fever </label>
            <label><input type="radio" name="choice" value="rot">  Flesh Rot </label>
            <label><input type="radio" name="choice" value="mindfire">  Mindfire </label>
            <label><input type="radio" name="choice" value="seizure">  Seizure </label>
            <label><input type="radio" name="choice" value="slimy">  Slimy Doom </label>
        `;

        let disease = await foundry.applications.api.DialogV2.prompt({
            content: content,
            rejectClose: false,
            ok: {
                callback: (event, button, dialog) => {
                    return button.form.elements.choice.value;
                }
            },
            window: {
                title: 'Select the Affliction'
            },
            position: {
                width: 400
            }
        });

        if (disease) {
            const actorDC = actor.system.attributes.spelldc ?? 12;
            for (let target of workflow.hitTargets) {
                await target.actor.setFlag(_flagGroup, flagName, {spelldc: actorDC, saves: 0, failures: 0});
                await applyDisease(target.actor, item, disease);
            }
        }
    }
    else if (args[0] === "each") {
        let flag = actor.getFlag(_flagGroup, flagName);
        if (flag) {
            if ((flag.saves < 3) && (flag.failures < 3)) {
                let saveRoll = await actor.rollAbilitySave("con", {flavor: "Contagion - DC " + flag.spelldc, damageType: "disease"});
                await game.dice3d?.showForRoll(saveRoll);
                if (saveRoll.total < flag.spelldc) {
                    await actor.setFlag(_flagGroup, flagName, {spelldc: flag.spelldc, saves: flag.saves, failures: flag.failures + 1});
                }
                else {
                    let newSaves = flag.saves + 1;
                    if (newSaves >= 3) {
                        await actor.unsetFlag(_flagGroup, flagName);
                        let diseaseEffects = actor.getRollData().effects.filter(eff => eff.origin === item.uuid);
                        if (diseaseEffects) {
                            await MidiQOL.socket().executeAsGM('removeEffects', {
                                actorUuid: actor.uuid,
                                effects: diseaseEffects.map(effect => effect.id)
                            });
                        }
                    }
                    else {
                        await actor.setFlag(_flagGroup, flagName, {spelldc: flag.spelldc, saves: newSaves, failures: flag.failures});
                    }
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyDisease(actor, item, disease) {
    let effectData;

    switch(disease) {
        case 'blinding':
            effectData = {
                name: 'Blinding Sickness',
                icon: item.img,
                origin: item.uuid,
                duration: {seconds: 604800 },
                changes: [
                    {
                        key: 'flags.midi-qol.disadvantage.ability.check.wis',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 20
                    },
                    {
                        key: 'flags.midi-qol.disadvantage.ability.save.wis',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 20
                    },
                    {
                        key: 'macro.CE',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: 'Blinded',
                        priority: 20
                    }
                ]
            };
            break;

        case 'fever':
            effectData = {
                name: 'Filth Fever',
                icon: item.img,
                origin: item.uuid,
                duration: {seconds: 604800 },
                changes: [
                    {
                        key: 'flags.midi-qol.disadvantage.ability.check.str',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 20
                    },
                    {
                        key: 'flags.midi-qol.disadvantage.ability.save.str',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 20
                    },
                    {
                        key: 'flags.midi-qol.disadvantage.attack.str',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 20
                    }
                ]
            };
            break;

        case 'rot':
            effectData = {
                name: 'Flesh Rot',
                icon: item.img,
                origin: item.uuid,
                duration: {seconds: 604800 },
                changes: [
                    {
                        key: 'flags.midi-qol.disadvantage.ability.check.cha',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 20
                    },
                    {
                        key: 'system.traits.dv.all',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 20
                    }
                ]
            };
            break;

        case 'mindfire':
            effectData = {
                name: 'Mindfire',
                icon: item.img,
                origin: item.uuid,
                duration: {seconds: 604800 },
                changes: [
                    {
                        key: 'flags.midi-qol.disadvantage.ability.check.int',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 20
                    },
                    {
                        key: 'flags.midi-qol.disadvantage.ability.save.int',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 20
                    }
                ]
            };
            // TODO apply confusion using Homebrew
            break;

        case 'seizure':
            effectData = {
                name: 'Seizure',
                icon: item.img,
                origin: item.uuid,
                duration: {seconds: 604800 },
                changes: [
                    {
                        key: 'flags.midi-qol.disadvantage.ability.check.dex',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 20
                    },
                    {
                        key: 'flags.midi-qol.disadvantage.ability.save.dex',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 20
                    },
                    {
                        key: 'flags.midi-qol.disadvantage.attack.dex',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 20
                    }
                ]
            };
            break;

        case 'slimy':
            effectData = {
                name: 'Slimy Doom',
                icon: item.img,
                origin: item.uuid,
                duration: {seconds: 604800 },
                changes: [
                    {
                        key: 'flags.midi-qol.disadvantage.ability.check.con',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 20
                    },
                    {
                        key: 'flags.midi-qol.disadvantage.ability.save.con',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: true,
                        priority: 20
                    }
                ]
            };
            // TODO whenever the creature takes damage, it is stunned until the end of its next turn
            break;

    }

    await MidiQOL.socket().executeAsGM('createEffects', {'actorUuid': actor.uuid, 'effects': [effectData]});
}
