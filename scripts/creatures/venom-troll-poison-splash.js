/*
    When the troll takes damage of any type but psychic, each creature within 5 feet of the troll takes 9 (2d8) poison damage.
*/
const version = "11.0";
const optionName = "Poison Splash";
const _flagGroup = "fvtt-trazzm-homebrew-5e";

try {
    if (args[0].macroPass === "isDamaged") {
        if (workflow.damageDetail) {
            let applyDamage = false;

            for (let dd of workflow.damageDetail) {
                if (dd.type && dd.type.toLowerCase() !== "psychic") {
                    applyDamage = true;
                    break;
                }
            }

            if (applyDamage) {
                let poisonSprayItem = actor.items.find(i => i.name === optionName);
                if (poisonSprayItem) {
                    let [config, options] = HomebrewHelpers.syntheticItemWorkflowOptions();
                    await MidiQOL.completeItemUse(poisonSprayItem, config, options);
                    await warpgate.wait(250);
                }
            }
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
