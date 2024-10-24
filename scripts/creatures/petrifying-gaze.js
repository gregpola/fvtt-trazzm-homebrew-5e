/*
    If a creature starts its turn within 30 feet of the basilisk and the two of them can see each other, the basilisk
    can force the creature to make a DC 12 Constitution saving throw if the basilisk isn't incapacitated. On a failed
    save, the creature magically begins to turn to stone and is restrained. It must repeat the saving throw at the end
    of its next turn. On a success, the effect ends. On a failure, the creature is petrified until freed by the greater
    restoration spell or other magic.

    A creature that isn't surprised can avert its eyes to avoid the saving throw at the start of its turn. If it does so,
    it can't see the basilisk until the start of its next turn, when it can avert its eyes again.

    If it looks at the basilisk in the meantime, it must immediately make the save. If the basilisk sees its reflection
    within 30 feet of it in bright light, it mistakes itself for a rival and targets itself with its gaze.
*/
const version = "12.3.0";
const optionName = "Petrifying Gaze";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const avertingGazeName = "Averting Gaze";
const avertGazeItem = await HomebrewHelpers.getItemFromCompendium('fvtt-trazzm-homebrew-5e.homebrew-automation-items', "Avert Gaze");
const turningName = "Turning to Stone";
const turnedToStoneName = "Turned to Stone";

try {
    let existingAvertGazeItem = actor.items.find(i => i.name === "Avert Gaze");

    if (args[0] === "on") {
        if (!HomebrewHelpers.hasConditionImmunity(actor, 'Petrified')) {
            if (!existingAvertGazeItem) {
                await actor.createEmbeddedDocuments("Item", [avertGazeItem]);
                const favoriteItem = actor.items.find(i => i.name === "Avert Gaze");
                if (favoriteItem) {
                    await HomebrewHelpers.addFavorite(actor, favoriteItem);
                }
            }
        }
    }
    else if (args[0] === "off") {
        if (existingAvertGazeItem) {
            existingAvertGazeItem.delete();
        }
    }
    else if (args[0] === "each") {
        // skip source actor
        // get the source token
        let effectItem = await fromUuid(lastArgValue.effectUuid);
        let sourceToken = fromUuidSync(effectItem.origin.substring(0, effectItem.origin.indexOf('.Actor.')));
        if (sourceToken?.id === token.id) {
            console.log(`${optionName} - skipping source token in EACH`);
            return;
        }

        if (!HomebrewHelpers.hasConditionImmunity(actor, 'Petrified')) {
            const avertingGazeEffect = HomebrewHelpers.findEffect(actor, avertingGazeName);
            const turningToStone = HomebrewHelpers.findEffect(actor, turningName);
            const canSeeBasilisk = await MidiQOL.canSee(token, sourceToken);
            const canSeeTarget = await MidiQOL.canSee(sourceToken, token);
            const petrifiedEffect = HomebrewHelpers.findEffect(actor, turnedToStoneName);

            if (lastArgValue.turn === "startTurn") {
                if (!avertingGazeEffect && !turningToStone && !petrifiedEffect && canSeeBasilisk && canSeeTarget) {
                    await game.MonksTokenBar.requestRoll([{token: token}], {
                        request: [{"type": "save", "key": "con"}],
                        dc: 12, showdc: true, silent: true, fastForward: false,
                        flavor: `${optionName}`,
                        rollMode: 'roll',
                        callback: async (result) => {
                            for (let tr of result.tokenresults) {
                                if (!tr.passed) {
                                    let restrainedEffect = {
                                        name: turningName,
                                        icon: 'icons/creatures/magical/construct-gargoyle-stone-gray.webp',
                                        changes: [
                                            {
                                                key: 'macro.CE',
                                                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                                                value: 'Restrained',
                                                priority: 20
                                            }
                                        ],
                                        origin: effectItem.origin,
                                        disabled: false,
                                        transfer: true
                                    };

                                    await MidiQOL.socket().executeAsGM("createEffects",
                                        {actorUuid: tr.actor.uuid, effects: [restrainedEffect]});
                                }
                            }
                        }
                    });
                }
            }
            else if (lastArgValue.turn === "endTurn") {
                // skip if same turn that started turning to stone
                if (turningToStone && !petrifiedEffect && (game.combat.round !== turningToStone.duration.startRound)) {
                    await game.MonksTokenBar.requestRoll([{token: token}], {
                        request: [{"type": "save", "key": "con"}],
                        dc: 12, showdc: true, silent: true, fastForward: false,
                        flavor: `${optionName}`,
                        rollMode: 'roll',
                        callback: async (result) => {
                            for (let tr of result.tokenresults) {
                                if (!tr.passed) {
                                    let petrifiedEffect = {
                                        name: `${turnedToStoneName}`,
                                        icon: 'icons/creatures/magical/construct-gargoyle-stone-gray.webp',
                                        changes: [
                                            {
                                                key: 'macro.CE',
                                                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                                                value: 'Petrified',
                                                priority: 20
                                            }
                                        ],
                                        origin: effectItem.origin,
                                        disabled: false,
                                        transfer: true
                                    };

                                    await MidiQOL.socket().executeAsGM("createEffects",
                                        {actorUuid: tr.actor.uuid, effects: [petrifiedEffect]});
                                }

                                await MidiQOL.socket().executeAsGM('removeEffects', {
                                    actorUuid: tr.actor.uuid,
                                    effects: [turningToStone.id]
                                });
                            }
                        }
                    });

                }
            }
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
