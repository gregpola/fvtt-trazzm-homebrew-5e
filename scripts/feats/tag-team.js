/*
    Tag Team. When you take the &Reference[Help] action, you can switch places with a willing ally within 5 feet of
    yourself as part of that same action. This movement doesn’t provoke &Reference[Opportunity Attacks]. You can’t use
    this benefit if the ally has the Incapacitated condition.
 */
const optionName = "Tag Team";
const version = "13.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const targetToken = workflow.targets.first();
        await HomebrewMacros.swapTokenPositions(token, targetToken);
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
