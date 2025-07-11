/*
    You conjure spinning daggers in a 5-foot Cube centered on a point within range. Each creature in that area takes
    4d4 Slashing damage. A creature also takes this damage if it enters the Cube or ends its turn there or if the Cube
    moves into its space. A creature takes this damage only once per turn.

    On your later turns, you can take a Magic action to teleport the Cube up to 30 feet.

    Using a Higher-Level Spell Slot. The damage increases by 2d4 for each spell slot level above 2.
 */
const optionName = "Cloud of Daggers Move";
const version = "12.4.1";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "cloud-of-daggers-flag";

try {
    if (args[0].macroPass === "postActiveEffects" && rolledActivity?.name === "Move Cloud") {
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
                        name: "Move Cloud of Daggers",
                        location: {
                            obj: template,
                            limitMaxRange: 30
                        },
                        snap: {
                            position: CONST.GRID_SNAPPING_MODES.SIDE_MIDPOINT
                        }
                    });

                    // LEFT_SIDE_MIDPOINT

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

