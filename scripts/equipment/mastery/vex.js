/*
    If you hit a creature with this weapon and deal damage to the creature, you have Advantage on your next attack roll
    against that creature before the end of your next turn.
*/
const optionName = "Weapon Mastery: Vex";
const version = "12.4.0";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _flagName = "mastery-vex-target";

try {
    if (game.combat && item.type === 'weapon' && item.system.mastery === 'vex' && HomebrewHelpers.hasMastery(actor, item)) {
        if (args[0].tag === "OnUse" && args[0].macroPass === "preAttackRoll") {
            let flag = actor.getFlag(_flagGroup, _flagName);
            if (flag) {
                let targetToken = workflow.targets.first();
                if (targetToken && targetToken.id === flag.targetId) {
                    // check times
                    let appliesToThisAttack = true;
                    const sourceTurn = game.combat.turns.findIndex(t => t.tokenId === token.id);

                    if (game.combat.round > flag.appliedRound) {
                        if (game.combat.turn > sourceTurn) {
                            appliesToThisAttack = false;
                        }
                        else if ((game.combat.round - flag.appliedRound) > 1) {
                            appliesToThisAttack = false;
                        }
                    }

                    if (appliesToThisAttack) {
                        workflow.advantage = true;
                    }

                    await actor.unsetFlag(_flagGroup, _flagName);
                }
            }
        } else if (args[0].tag === "OnUse" && args[0].macroPass === "postActiveEffects") {
            let targetToken = workflow.hitTargets.first();
            if (targetToken && item.type === 'weapon' && item.system.mastery === 'vex') {
                // check if damage was applied
                let damageApplied = (workflow.damageItem.oldHP !== workflow.damageItem.newHP || workflow.damageItem.oldTempHP !== workflow.damageItem.newTempHP);
                if (damageApplied) {
                    await actor.setFlag(_flagGroup, _flagName, {
                        targetId: targetToken.id,
                        appliedRound: game.combat.round
                    });
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
