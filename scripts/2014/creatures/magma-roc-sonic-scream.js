/*
    The magma roc emits a piercing scream audible within 300 feet. Creatures within 40 feet of the magma roc must
    succeed on a DC 16 Wisdom saving throw or be Stunned until the end of the magma roc's next turn. Those who fail the
    save by 5 or more are also Deafened until completing a long rest.
 */
const version = "12.3.0";
const optionName = "Sonic Scream";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let saveDC = item.system.save.dc;

        for (let targetToken of workflow.failedSaves) {
            let targetIndex = midiData.targets.indexOf(targetToken.document);
            let targetResult = workflow.saveResults[targetIndex].total ?? 0;

            await HomebrewEffects.applyStunnedEffect(targetToken.actor, workflow.item, ['turnEndSource']);

            if (targetResult < (saveDC - 4)) {
                await HomebrewEffects.applyDeafenedEffect(targetToken.actor, workflow.item, ['longRest']);
            }
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
