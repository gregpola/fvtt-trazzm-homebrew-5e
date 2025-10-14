const optionName = "Controlled Mutation";
const version = "13.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        for (let targetToken of workflow.targets) {
            let currentContamination = targetToken.actor.flags.drakkenheim?.contamination ?? 0;
            await targetToken.actor.update({['flags.drakkenheim.contamination']: currentContamination+1});
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
