for (let targetToken of workflow.failedSaves) {
    await targetToken.actor.toggleStatusEffect('prone', {active: true});
}
