/*
    You study your opponents and learn from each attack you make. If you make an attack roll against a creature and
    miss, you have Advantage on your next attack roll against that creature before the end of your next turn.
 */
const version = "12.4.0";
const optionName = "Studied Attacks";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _flagName = "studied-attacks";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "preAttackRoll") {
        let flag = actor.getFlag(_flagGroup, _flagName);
        if (flag && !checkExpired(flag)) {
            const targetToken = workflow.targets.first();
            if (targetToken.id === flag.targetTokenId) {
                workflow.advantage = true;
                await actor.setFlag(_flagGroup, _flagName, {targetTokenId: flag.targetTokenId, round: flag.round, expired: true });
            }
        }
    }
    else if (args[0].tag === "OnUse" && args[0].macroPass === "postAttackRoll") {
        let flag = actor.getFlag(_flagGroup, _flagName);
        if (flag) {
            await actor.unsetFlag(_flagGroup, _flagName);
        }
        else {
            let targetToken = workflow.hitTargets.first();
            if (!targetToken) {
                targetToken = workflow.targets.first();
                await actor.setFlag(_flagGroup, _flagName, {targetTokenId: targetToken.id, round: game.combat.round, expired: false });
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

function checkExpired(flag) {
    if (flag) {
        const roundDiff = game.combat.round - flag.round;
        if (roundDiff > 1) {
            return true;
        }

        if (flag.expired) {
            return true;
        }
    }

    return false;
}
