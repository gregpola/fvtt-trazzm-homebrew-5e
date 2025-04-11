let targetToken = macroActivity.targets.first();
if (targetToken) {
    await targetToken.actor.toggleStatusEffect('prone', {active: true});
}
