/*
    When you cast this spell, the target can choose to gain a Contamination Level as well. If it does, it instead
    regains hit points equal to 8d6 + your spellcasting ability modifier.
*/
const optionName = "Corrupted Cure";
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
