/*
    You touch a creature, and that creature must succeed on a Wisdom saving throw or become cursed for the duration of
    the spell. When you cast this spell, choose the nature of the curse from the following options:

    - Choose one ability score. While cursed, the target has disadvantage on ability checks and saving throws made with that ability score.
    - While cursed, the target has disadvantage on attack rolls against you.
    - While cursed, the target must make a Wisdom saving throw at the start of each of its turns. If it fails, it wastes its action that turn doing nothing.
    - While the target is cursed, your attacks and spells deal an extra 1d8 necrotic damage to the target.

    A remove curse spell ends this effect. At the DM's option, you may choose an alternative curse effect, but it should
    be no more powerful than those described above. The DM has final say on such a curse's effect.

    At Higher Levels. If you cast this spell using a spell slot of 4th level or higher, the duration is concentration,
    up to 10 minutes. If you use a spell slot of 5th level or higher, the duration is 8 hours. If you use a spell slot
    of 7th level or higher, the duration is 24 hours. If you use a 9th level spell slot, the spell lasts until it is
    dispelled. Using a spell slot of 5th level or higher grants a duration that doesn't require concentration.
*/
const version = "12.3.0";
const optionName = "Bestow Curse";
const _flagGroup = "fvtt-trazzm-homebrew-5e";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let existingConcentration = MidiQOL.getConcentrationEffect(actor, item);

        if (!workflow.failedSaves.size) {
            await existingConcentration.delete();
            return;
        }

        // Calculate the duration
        const spellLevel = workflow.castData.castLevel;
        let needsConcentration = spellLevel < 5;
        let duration = 60;

        if (spellLevel < 4) {
            duration = 60;
        }
        else if (spellLevel < 5) {
            duration = 600;
        }
        else if (spellLevel < 7) {
            duration = 28800;
        }
        else if (spellLevel < 9) {
            duration = 86400;
        }
        else {
            duration = "permanent";
        }

        // Remove concentration if needed
        if (!needsConcentration && existingConcentration) {
            await existingConcentration.delete();
        }

        // ask which curse
        const title = `${optionName} - Which Curse?`;

        let buttons = [
            {label: 'Ability Disadvantage', value: 'Ability'},
            {label: 'Attack Disadvantage', value: 'Attack'},
            {label: 'Lose Action', value: 'Action'},
            {label: 'Necrotic Damage', value: 'Damage'},
            {label: 'Custom', value: 'Custom'}
        ];

        let curseChoice = await HomebrewHelpers.buttonDialog(
            {
                buttons,
                title
            },
            'column'
        );

        if (curseChoice) {
            let effectName = workflow.item.name + ': ' + (buttons.find(x => x.value === curseChoice).label);

            let targetEffectData = {
                name: effectName,
                img: workflow.item.img,
                origin: workflow.item.uuid,
            };

            if (!isNaN(duration)) {
                targetEffectData.duration = {
                    seconds: duration
                };
            }

            switch (curseChoice) {
                case 'Ability': {
                    let ability = await HomebrewHelpers.selectAbilityDialog("Select Ability to Curse");
                    if (ability) {
                        targetEffectData.changes = [
                            {
                                key: 'flags.midi-qol.disadvantage.ability.check.' + ability,
                                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                                value: true,
                                priority: 20
                            },
                            {
                                key: 'flags.midi-qol.disadvantage.ability.save.' + ability,
                                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                                value: true,
                                priority: 20
                            }
                        ];
                    }
                    else {
                        targetEffectData = undefined;
                    }
                    break;
                }
                case 'Attack': {
                    targetEffectData.changes = [
                        {
                            key: 'flags.midi-qol.disadvantage.attack.all',
                            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                            value: `targetActorUuid === ${actor.uuid}`,
                            priority: 20
                        }
                    ];
                    break;
                }
                case 'Action': {
                    const saveDC = actor.system?.attributes?.spelldc ?? 12;
                    targetEffectData.changes = [
                        {
                            key: 'flags.midi-qol.OverTime',
                            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                            value: 'turn=start,saveAbility=wis,saveMagic=true,saveRemove=false,saveDC=' + saveDC + ',label="' + workflow.item.name + ' (Lose Action)"',
                            priority: 20
                        }
                    ];
                    break;
                }
                case 'Damage': {
                    // add damage bonus to caster
                    let casterEffectData = {
                        name: effectName,
                        img: workflow.item.img,
                        origin: workflow.item.uuid,
                        duration: {
                            seconds: null,
                        },
                        changes: [
                            {
                                key: 'flags.dnd5e.DamageBonusMacro',
                                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                                value: "ItemMacro.Bestow Curse",
                                priority: 20
                            }
                        ],
                        flags: {
                            'fvtt-trazzm-homebrew-5e': {
                                bestowCurse: {
                                    targets: Array.from(workflow.failedSaves).map(target => target.document.uuid)
                                }
                            }
                        }
                    };
                    let appliedEffect = await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [casterEffectData] });
                    if (existingConcentration) {
                        await MidiQOL.socket().executeAsGM('addDependent', {concentrationEffectUuid: existingConcentration.uuid, dependentUuid: appliedEffect[0].uuid});
                    }
                    break;
                }
                case 'Custom': {
                    break;
                }
            }

            // add effect to target(s)
            for (let targetToken of workflow.failedSaves) {
                let ed = await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetToken.actor.uuid, effects: [targetEffectData] });
                if (existingConcentration) {
                    await MidiQOL.socket().executeAsGM('addDependent', {concentrationEffectUuid: existingConcentration.uuid, dependentUuid: ed[0].uuid});
                }
            }

            if (needsConcentration && existingConcentration && !isNaN(duration)) {
                await existingConcentration.update({'duration.seconds': duration});
            }
        }
    }
    else if (args[0].macroPass === "DamageBonus") {
        const bestowCurseEffect = HomebrewHelpers.findEffect(actor, "Bestow Curse: Necrotic Damage");
        if (bestowCurseEffect) {
            const flag = bestowCurseEffect.getFlag(_flagGroup, 'bestowCurse');
            if (flag) {
                let extraDamageTargets = workflow.hitTargets.filter(target => flag.targets.includes(target.document.uuid));
                if (extraDamageTargets.size > 0) {
                    const roll = await new Roll('1d8').evaluate();

                    await MidiQOL.applyTokenDamage(
                        [{damage: roll.total , type:'necrotic'}],
                        roll.total, extraDamageTargets, item, new Set());
                }
            }
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
