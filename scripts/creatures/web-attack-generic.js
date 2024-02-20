const version = "11.1";
const optionName = "Web Attack";

try {
    if (args[0].macroPass === "postActiveEffects") {
        if (workflow.hitTargets.size > 0) {
            // add restrained to the targets that failed their save
            for (let target of workflow.hitTargets) {
                await HomebrewMacros.applyRestrained(token, target, 12, "str");
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
