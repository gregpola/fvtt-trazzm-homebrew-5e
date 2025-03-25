/*
    When a creature that can see the medusa's eyes starts its turn within 30 feet of the medusa, the medusa can force it
    to make a DC 14 Constitution saving throw if the medusa isn't incapacitated and can see the creature. If the saving
    throw fails by 5 or more, the creature is instantly petrified. Otherwise, a creature that fails the save begins to
    turn to stone and is restrained. The restrained creature must repeat the saving throw at the end of its next turn,
    becoming petrified on a failure or ending the effect on a success. The petrification lasts until the creature is
    freed by the greater restoration spell or other magic.
*/
const version = "12.3.0";
const optionName = "Petrifying Gaze";
const avertingGazeName = "Averting Gaze";
const avertGazeItem = await HomebrewHelpers.getItemFromCompendium('fvtt-trazzm-homebrew-5e.homebrew-automation-items', "Avert Gaze");

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
            const turningToStone = HomebrewHelpers.findEffect(actor, 'Restrained', effectItem.origin);
            const canSeeMedusa = await MidiQOL.canSee(token, sourceToken);
            const canSeeTarget = await MidiQOL.canSee(sourceToken, token);
            const petrifiedEffect = HomebrewHelpers.findEffect(actor, 'Petrified', effectItem.origin);

            if (lastArgValue.turn === "startTurn") {
                if (!avertingGazeEffect && !turningToStone && !petrifiedEffect && canSeeMedusa && canSeeTarget) {
                    await game.MonksTokenBar.requestRoll([{token: token}], {
                        request: [{"type": "save", "key": "con"}],
                        dc: 14, showdc: true, silent: true, fastForward: false,
                        flavor: `${optionName}`,
                        rollMode: 'roll',
                        callback: async (result) => {
                            for (let tr of result.tokenresults) {
                                if (!tr.passed) {
                                    if (tr.roll.total < 10) {
                                        await HomebrewEffects.applyPetrifiedEffect(tr.actor, effectItem.origin);
                                    }
                                    else {
                                        await HomebrewEffects.applyRestrainedEffect(tr.actor, effectItem.origin, undefined, undefined, ['turnEnd']);
                                    }
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
                        dc: 14, showdc: true, silent: true, fastForward: false,
                        flavor: `${optionName}`,
                        rollMode: 'roll',
                        callback: async (result) => {
                            for (let tr of result.tokenresults) {
                                if (!tr.passed) {
                                    await HomebrewEffects.applyPetrifiedEffect(tr.actor, effectItem.origin);
                                }
                            }
                        }
                    });

                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
