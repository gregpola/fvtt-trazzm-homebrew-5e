/*
    A flock of floating spectral hands appear and grasp a target you
    can see within range. The target must succeed on a Strength
    saving throw. A target takes 3d8 necrotic damage on a failed
    save, or half as much damage on a successful one.

    In addition, on a failed saving throw the ghostly hands grapple
    the target until the end of your next turn, and immediately
    move the target up to 30 feet in a direction of your choice (but
    not upward). On its turn, the creature can use an action to attempt
    to escape the grapple by making a Strength or Dexterity
    check (its choice) against your spell save DC. If it succeeds, the
    grapple ends.
*/
const optionName = "Grasping Ghost";
const version = "13.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        for(let targetToken of workflow.failedSaves) {
            await new Portal()
                .color("#ff0000")
                .texture("icons/svg/target.svg")
                .origin(targetToken)
                .range(30)
                .teleport();
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
