/*
	Once before the spell ends, you can give yourself advantage on one weapon attack roll on your turn. That attack
	deals an extra 1d8 force damage on a hit. Whether you hit or miss, your walking speed increases by 30 feet until
	the end of that turn.
*/
const optionName = "Zephyr Strike";
const version = "14.5.0";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _flagName = "zephyr-strike";

try {
    if (args[0].macroPass === "postActiveEffects") {
        await actor.unsetFlag(_flagGroup, _flagName);
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
