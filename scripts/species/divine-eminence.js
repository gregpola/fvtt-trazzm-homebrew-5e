/*
    As a bonus action, the cleric can expend a spell slot to cause its melee weapon attacks to magically deal an extra
    10 ([[/r 3d6]]) radiant damage to a target on a hit. This benefit lasts until the end of the turn. If the cleric
    expends a spell slot of 2nd level or higher, the extra damage increases by [[/r 1d6]] for each level above 1st.
*/
const optionName = "Divine Eminence";
const version = "13.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let featureEffect = HomebrewHelpers.findEffect(actor, optionName);
        if (featureEffect) {
            let changes = foundry.utils.duplicate(featureEffect.changes);
            //changes[0].value =
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
