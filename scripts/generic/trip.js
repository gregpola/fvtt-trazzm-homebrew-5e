for (let targetToken of workflow.failedSaves) {
    await game.trazzm.socket.executeAsGM(
        "toggleStatusEffect",
        {actorUuid: targetToken.actor.uuid, statusId: 'prone', enabled: true});
}