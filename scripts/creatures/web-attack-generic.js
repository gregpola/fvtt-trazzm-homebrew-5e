const version = "11.0";
const optionName = "Web Attack";

try {
    if (args[0].macroPass === "postActiveEffects") {
        if (workflow.hitTargets.size > 0) {
            // add restrained to the targets that failed their save
            const saveDC = item.system.save.dc;
            for (let target of workflow.hitTargets) {
                await HomebrewMacros.applyRestrained(token, target, saveDC, "str");
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
