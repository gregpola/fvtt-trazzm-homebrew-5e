/*
     The target must roll to resist @Item[OzClCfcJ9QNv0zYc]{Drow Poison}. The target also takes 10 ([[/r 3d6]]) poison
     damage on a failed save, or half as much damage on a successful one.
*/
const optionName = "Drow Weapon Damage";
const version = "13.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const targetToken = workflow.failedSaves.first();

    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
