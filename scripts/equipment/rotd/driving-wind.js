/*
    As an action, Jalzahir can call the winds to move a creature that is large or smaller to a position up to 10 feet
    away from their current position on a failed Strength saving throw.
*/
const optionName = "Gathered Swarm - Move";
const version = "13.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const targetToken = workflow.failedSaves.first();

        if (targetToken) {
            await new Portal()
                .color("#ff0000")
                .texture("icons/svg/target.svg")
                .origin(targetToken)
                .range(10)
                .teleport();
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
