/*
    During its first turn, the assassin has advantage on attack rolls against any creature that hasn’t taken a turn. Any
    hit the assassin scores against a surprised creature is a critical hit.
*/
const version = "12.4.0";
const optionName = "Assassinate";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "preAttackRoll") {
        if (game.combat?.round === 1) {
            let targetToken = workflow.targets.first();
            if (targetToken) {
                // check for attack advantage
                const sourceTurn = game.combat.turns.findIndex(t => t.tokenId === token.id);
                const targetTurn = game.combat.turns.findIndex(t => t.tokenId === targetToken.id);

                if (sourceTurn < targetTurn) {
                    workflow.advantage = true;
                }
            }
        }
    }
    else if (args[0].tag === "OnUse" && args[0].macroPass === "preDamageRoll") {
        let targetToken = workflow.targets.first();
        if (targetToken) {
            const isSurprised = targetToken.actor.effects.find(eff => eff.name === "Surprised");
            if (isSurprised) {
                workflow.workflowOptions.isCritical = true;
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
