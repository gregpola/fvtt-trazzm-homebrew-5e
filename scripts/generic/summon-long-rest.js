if (workflow?.summonedCreatures) {
    for (let token of workflow.summonedCreatures) {
        await token.actor.longRest({dialog: false, chat: false, newDay: true});
    }
}
