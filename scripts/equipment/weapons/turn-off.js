/*
	Turns an enchantment off, like a Blazing Flame Tongue
*/
const optionName = "Turn Off";
const version = "14.5.0";
const enchantmentName = "Ablaze";

try {
    if (args[0].macroPass === "postActiveEffects") {
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
