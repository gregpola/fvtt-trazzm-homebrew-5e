const version = "12.3.0"
const optionName = "Cloud of Daggers";
const templateFlag = "cloud-of-daggers-template";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const regionFlag = "spell.CloudOfDaggers";

try {
    if (args[0].macroPass === "postActiveEffects") {
        await HomebrewHelpers.storeSpellDataInRegion(workflow.templateId, token, workflow.castData.castLevel, templateFlag, regionFlag);
    }
    else if (args[0] === "off") {
        // delete the actor flag
        const templateId = actor.getFlag(_flagGroup, templateFlag);
        if (templateId) {
            await actor.unsetFlag(_flagGroup, templateFlag);
        }
    }

} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}
