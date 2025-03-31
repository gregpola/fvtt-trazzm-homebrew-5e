/*
    Concentration Breaker. When you damage a creature that is concentrating, it has Disadvantage on the saving throw it
    makes to maintain Concentration.
 */
const version = "12.4.0";
const optionName = "Mage Slayer - Concentration Breaker";

try {
    if (args[0].macroPass === "postActiveEffects") {
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
