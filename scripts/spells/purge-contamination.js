/*
	You apply alchemical fluids or holy water to a contaminated humanoid creature while reciting an exacting magical
	chant which expels eldritch contaminants from its body. When you finish casting the spell, all contamination levels
	and mutations are removed from the creature. It then gains 1 level of exhaustion for each contamination level
	removed with this spell.
*/
const optionName = "Purge Contamination";
const version = "13.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        for (let targetToken of workflow.targets) {
            let currentContamination = targetToken.actor.flags.drakkenheim?.contamination ?? 0;

            if (currentContamination > 0) {
                await targetToken.actor.update({['flags.drakkenheim.contamination']: 0});

                const currentExhaustion = targetToken.actor.system.attributes.exhaustion ?? 0;
                await targetToken.actor.update({'system.attributes.exhaustion': currentExhaustion + currentContamination});
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
