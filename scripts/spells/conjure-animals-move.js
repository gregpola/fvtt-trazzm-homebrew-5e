/*
    A silvery beam of pale light shines down in a 5-foot-radius, 40-foot-high Cylinder centered on a point within range.
    Until the spell ends, Dim Light fills the Cylinder, and you can take a Magic action on later turns to move the
    Cylinder up to 60 feet.
 */
const optionName = "Conjure Animals Move";
const version = "13.5";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "conjure-animals-flag";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const flag = actor.getFlag(_flagGroup, flagName);
        if (flag) {
            const template = await fromUuid(flag.templateUuid);
            if (template) {
                let newTemplate = await fromUuid(args[0].templateUuid);
                if (newTemplate) {
                    const newX = newTemplate.x;
                    const newY = newTemplate.y;
                    await game.trazzm.socket.executeAsGM("updateTemplate", template.uuid, {x: newX, y: newY});

                } else {
                    const position = await Sequencer.Crosshair.show({
                        name: "Move Animals",
                        location: {
                            obj: template,
                            limitMaxRange: 60
                        },
                        snap: {
                            position: CONST.GRID_SNAPPING_MODES.VERTEX | CONST.GRID_SNAPPING_MODES.CENTER
                        }
                    });

                    if (position) {
                        await game.trazzm.socket.executeAsGM("updateTemplate", template.uuid, {x: position.x, y: position.y});
                    }
                }
            }
            else {
                console.error(`${optionName}: ${version} -- unable to find template`);
            }
        }
        else {
            console.error(`${optionName}: ${version} -- flag missing in actor`);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

