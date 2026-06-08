for (let targetToken of workflow.hitTargets) {
    if (HomebrewHelpers.isLargeOrSmaller(targetToken)) {
        await targetToken.actor.toggleStatusEffect('prone', {active: true});
    }
}
