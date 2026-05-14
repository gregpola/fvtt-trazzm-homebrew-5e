if (workflow?.summonedCreatures) {
    for (let token of workflow.summonedCreatures) {
        await token.actor.update({
            "system.abilities.cha.value": actor.system.abilities.cha.value
        });
        await token.actor.longRest({dialog: false, chat: false, newDay: true});
    }
}
