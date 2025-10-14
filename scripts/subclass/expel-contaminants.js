/*
    You’ve discovered an arcane method to safely discharge eldritch pollutants from your own body. Whenever you finish
    a long rest, you can reduce your Contamination Level by an amount equal to half your proficiency bonus (rounded down).
*/
const optionName = "Expel Contaminants";
const version = "13.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let currentContamination = targetToken.actor.flags.drakkenheim?.contamination ?? 0;
        const contaminationReduction = Math.floor(actor.system.attributes.prof / 2);

        if (currentContamination > 0) {
            currentContamination = Math.max(0, currentContamination - contaminationReduction);
            await actor.update({['flags.drakkenheim.contamination']: currentContamination});
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
