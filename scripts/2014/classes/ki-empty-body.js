/*
	Beginning at 18th level, you can use your action to spend 4 ki points to become invisible for 1 minute. During that
	time, you also have resistance to all damage but force damage.

	Additionally, you can spend 8 ki points to cast the Astral Projection spell, without needing material components.
	When you do so, you can't take any other creatures with you.
*/	
const version = "12.3.0";
const optionName = "Empty Body";

try {
	if (args[0].macroPass === "postActiveEffects") {
		await HomebrewEffects.applyInvisibleEffect(actor, item, ['1Attack', '1Spell']);
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
