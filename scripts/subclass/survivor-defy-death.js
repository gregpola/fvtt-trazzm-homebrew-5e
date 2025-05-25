/*
    You have Advantage on Death Saving Throws. Moreover, when you roll 18–20 on a Death Saving Throw, you gain the
    benefit of rolling a 20 on it.
 */
const version = "12.4.0";
const optionName = "Survivor - Defy Death";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postSave") {
        //if (workflow.saveResults[0][0].total <= (saveDC - 5)) {
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
