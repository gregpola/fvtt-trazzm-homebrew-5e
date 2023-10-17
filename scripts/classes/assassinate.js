/*
    Starting at 3rd level, you are at your deadliest when you get the drop on your enemies. You have advantage on attack
    rolls against any creature that hasn’t taken a turn in the combat yet. In addition, any hit you score against a
    creature that is surprised is a critical hit.
 */
const version = "11.0";
const optionName = "Assassinate";

try {
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
        if (targetActor.effects.find(eff => eff.name === "Surprised")) {
            game.assassinateDamageHookdId = Hooks.once("midi-qol.preDamageRoll", (workflow) => {
                foundry.utils.setProperty(workflow.rollOptions, "critical", true);
            })
        }
    }
    Hooks.once("midi-qol.RollComplete", () => {
        if (game.assassinateAttackHookdId) Hooks.off("", game.assassinateAttackHookdId);
        if (game.assassinateDamageHookdId) Hooks.off("", game.assassinateDamageHookdId);
    });

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
