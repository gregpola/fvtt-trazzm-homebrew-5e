if (game.combat?.round !== 1) return;

const sourceTokenId = args[0].tokenId;
const targetToken = args[0].targets[0];
const targetActor = args[0].targets[0].actor;
const targetTokenId = targetToken.id;

const sourceTurn = game.combat.turns.findIndex(t => t.tokenId === sourceTokenId);
const targetTurn = game.combat.turns.findIndex(t => t.tokenId === targetTokenId);

if (sourceTurn < targetTurn) {
    game.assassinateAttackHookdId = Hooks.once("midi-qol.preAttackRoll", (workflow) => {
        foundry.utils.setProperty(workflow, "advantage", true);
    })
    if (targetActor.effects.find(eff => eff.label === "Surprised")) {
        game.assassinateDamageHookdId = Hooks.once("midi-qol.preDamageRoll", (workflow) => {
            foundry.utils.setProperty(workflow.rollOptions, "critical", true);
        })
    }
}
Hooks.once("midi-qol.RollComplete", () => {
    if (game.assassinateAttackHookdId) Hooks.off("", game.assassinateAttackHookdId);
    if (game.assassinateDamageHookdId) Hooks.off("", game.assassinateDamageHookdId);
});