/*
    If you are smaller than Large, you become Large, along with anything you are wearing. If you lack the room to become Large, your size doesn’t change.
*/
const optionName = "Giant's Might";
const version = "14.5.0";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _flagName = "giants-might";

const SIZE_ORDER = ["tiny", "sm", "med", "lg", "huge", "grg"];
const SIZE_TO_GRID = {
    tiny: 0.5,
    sm: 1,
    med: 1,
    lg: 2,
    huge: 3,
    grg: 4,
};

try {
    if (args[0] === "on") {
        let flag = actor.getFlag(_flagGroup, _flagName);
        if (!flag) {
            const currentSize = actor.system.traits.size;
            if (["tiny", "sm", "med"].includes(currentSize)) {
                const newSize = "lg";
                const newGrid = SIZE_TO_GRID[newSize];

                await actor.setFlag(_flagGroup, _flagName,
                    { originalSize: currentSize, originalHeight: token.document.height, originalWidth: token.document.width });

                await token.document.update({
                    width: newGrid,
                    height: newGrid
                });

                await actor.update({ "system.traits.size": newSize });
            }
        }
    }
    else if (args[0] === "off") {
        let flag = actor.getFlag(_flagGroup, _flagName);
        if (flag) {
            await actor.update({ "system.traits.size": flag.originalSize });

            await token.document.update({
                width: flag.originalWidth,
                height: flag.originalHeight
            });

            await actor.unsetFlag(_flagGroup, _flagName);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
