/*
	Pulls the target to the monsters space for features like Engulf
*/
const optionName = "Pull";
const version = "14.5.0";
try {
    if (args[0].macroPass === "postActiveEffects") {
        for (let targetToken of workflow.failedSaves) {
            let tokenDistance = MidiQOL.computeDistance(token, targetToken);
            let maxMovement = ((tokenDistance / 5) * 5) + 5;
            await HomebrewMacros.pullTarget(token, targetToken, maxMovement / 5);
            await HomebrewMacros.wait(500);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
