/*
	You’re adept at ambushing a target, granting you the following benefits.

	Initiative. You have Advantage on Initiative rolls.

	Surprising Strikes. During the first round of each combat, you have Advantage on attack rolls against any creature
	that hasn’t taken a turn. If your Sneak Attack hits any target during that round, the target takes extra damage of
	the weapon’s type equal to your Rogue level.
*/
const optionName = "Assassinate";
const version = "12.4.0";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "preAttackRoll") {
        const targetToken = workflow.targets.first();

        if ((game.combat?.round === 1) && targetToken) {
            const targetTurn = game.combat.turns.findIndex(t => t.tokenId === targetToken.id);

            if (game.combat.turn < targetTurn) {
                workflow.advantage = true;
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
