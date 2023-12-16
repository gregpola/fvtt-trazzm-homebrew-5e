/*
    You speak a one-word command to a creature you can see within range. The target must succeed on a Wisdom saving throw
    or follow the command on its next turn. The spell has no effect if the target is undead, if it doesn’t understand
    your language, or if your command is directly harmful to it.

    Higher Levels. When you cast this spell using a spell slot of 2nd level or higher, you can affect one additional
    creature for each slot level above 1st. The creatures must be within 30 feet of each other when you target them.
 */
const optionName = "Command";
const version = "11.0";


try {
    if (args[0].macroPass === "preambleComplete") {
        const spellLevel = workflow.castData.castLevel;
        const targetCount = spellLevel;

        if (workflow.targets.size > targetCount) {
            ui.notifications.error(`${optionName}: too many targets selected`);
            return false;
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
