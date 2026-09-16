const version = "14.5.0";
const optionName = "Arcane Artist";

try {
    const targetToken = workflow.targets.first();
    if (targetToken) {
        await targetToken.actor.update({'system.attributes.inspiration' : true});
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
