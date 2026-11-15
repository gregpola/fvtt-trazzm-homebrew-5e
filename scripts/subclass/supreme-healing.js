/**
 *  When you would normally roll one or more dice to restore Hit Points to a creature with a spell or Channel Divinity,
 *  don't roll those dice for the healing; instead use the highest number possible for each die. For example, instead of
 *  restoring 2d6 Hit Points to a creature with a spell, you restore 12.
*/
const optionName = "Supreme Healing";
const version = "14.5.0";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "preDamageRollComplete") {
        // make sure it's a healing spell or Channel Divinity healing
        if ((rolledItem.type === "spell" || HomebrewHelpers.isChannelDivinityActivity(rolledActivity)) && rolledActivity.healing !== undefined) {
            // maximize the damage
            await Promise.all(workflow.damageRolls.map(async (damageRoll, i, arr) => {
                arr[i] = await damageRoll.reroll({maximize: true});
            }));
            await workflow.setDamageRolls(workflow.damageRolls);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
