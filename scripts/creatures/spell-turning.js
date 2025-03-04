/*
    The crag cat has advantage on saving throws against any spell that targets only the cat (not an area). If
    the cat’s saving throw succeeds and the spell is of 7th level or lower, the spell has no effect on the cat and
    instead targets the caster.
*/
const version = "12.3.0";
const optionName = "Spell Turning";
const targetTypes = ['enemy', 'creature', 'creatureOrObject', 'any'];

try {
    if (args[0].tag === "TargetOnUse" && args[0].macroPass === "preTargetSave" && item.type === 'spell' && targetTypes.includes(item.system.target.type)) {
        workflow.saveDetails.advantage = true;
    }
    else if (args[0].tag === "TargetOnUse"
        && args[0].macroPass === "isSaveSuccess"
        && item.type === 'spell'
        && targetTypes.includes(item.system.target.type)
        && (item.system.level <= 7)) {
        let [config, options] = HomebrewHelpers.syntheticItemWorkflowOptions([workflow.token.document.uuid], false, workflow.castData.castLevel, false);
        let spellItem = foundry.utils.duplicate(item);
        let feature = new CONFIG.Item.documentClass(spellItem, {'parent': workflow.actor});
        await MidiQOL.completeItemUse(feature, config, options);
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
