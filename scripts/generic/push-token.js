const targetToken = workflow.targets.first();
if (targetToken && HomebrewHelpers.isLargeOrSmaller(targetToken)) {
    await HomebrewMacros.pushTarget(token, targetToken, 3);
}
