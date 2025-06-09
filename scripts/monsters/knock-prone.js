for (let targetToken of workflow.hitTargets) {
    if (["tiny", "sm", "med"].includes(targetToken.actor.system.traits.size)) {
        await targetToken.actor.toggleStatusEffect('prone', {active: true});
    }
}
