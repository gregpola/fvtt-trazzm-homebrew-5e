/*
    A creature that drinks this vial of liquid gains advantage on saving throws against poison for 1 hour. It confers no benefit to undead or constructs.
*/
const version = "11.0";
const optionName = "Antitoxin";

try {
    if (args[0].macroPass === "preTargetSave") {
        if (rolledItem) {
            if (rolledItem.system.formula.toLowerCase().includes("poison")
                || rolledItem.effects.some(eff=>eff.name.toLowerCase() === "poisoned")
                || rolledItem.effects.some(eff=>eff.changes.some(c => ["Poisoned (CE)", "Poisoned"].some(con=>c.value.includes(con))))) {
                workflow.saveDetails.advantage = true;
            }
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
