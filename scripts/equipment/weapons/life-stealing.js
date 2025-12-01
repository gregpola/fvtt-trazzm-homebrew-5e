/*
     If the attack roll is a 20 the target takes an additional 15 necrotic damage and you gain temporary hit points equal to the necrotic damage.
*/
const optionName = "Life Stealing";
const version = "13.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        console.log(workflow);
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
