let targetToken = macroActivity.targets.first();
if (HomebrewHelpers.isSizeEligibleForGrapple(token, targetToken)) {
    await HomebrewMacros.pushTarget(token, targetToken, 2);
}
else {
    ui.notifications.error(`Charger Push - ${targetToken.name} is too big to push`);
}
