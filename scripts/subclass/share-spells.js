/*
    When you cast a spell targeting yourself, you can also affect your Primal Companion beast with the spell if the
    beast is within 30 feet of you.
*/
const optionName = "Share Spells";
const version = "12.4.0";
const effectName = "Summon: Primal Companion";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postActiveEffects" && item.type === "spell") {
        // check the targeting
        // const beastCompanion = await HomebrewHelpers.findBeastCompanion(actor);
        // if (beastCompanion) {
        //     console.log(beastCompanion);
        // }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
