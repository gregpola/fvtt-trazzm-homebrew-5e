/*
    You magically twist space around another creature you can see within range. The target must succeed on a
    Constitution saving throw (the target can choose to fail), or the target is teleported to an unoccupied space of
    your choice that you can see within range. The chosen space must be on a surface or in a liquid that can support the
    target without the target having to squeeze.

    At Higher Levels. When you cast this spell using a spell slot of 3rd level or higher, the range of the spell
    increases by 30 feet for each slot level above 2nd.
*/
const optionName = "Vortex Warp";
const version = "14.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const maxRange = Number(macroItem.system.range.value);

        for(let targetToken of workflow.failedSaves) {
            await new Portal()
                .color("#ff0000")
                .texture("icons/svg/target.svg")
                .origin(targetToken)
                .range(maxRange)
                .teleport();
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
