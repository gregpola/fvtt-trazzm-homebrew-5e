/*
    While entirely within Dim Light or Darkness, you can use a Bonus Action to teleport up to 60 feet to an unoccupied
    space you can see that is also in Dim Light or Darkness. You then have Advantage on the next melee attack you make
    before the end of the current turn.
 */
const version = "12.4.0";
const optionName = "Shadow Step";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const maxRange = workflow.item.system.range.value ?? 60;
        await HomebrewMacros.teleportToken(token, maxRange);
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
