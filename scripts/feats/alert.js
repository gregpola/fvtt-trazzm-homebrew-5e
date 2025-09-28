/*
    Initiative Swap. Immediately after you roll Initiative, you can swap your Initiative with the Initiative of one
    willing ally in the same combat. You can’t make this swap if you or the ally has the [Incapacitated] condition.
*/
const optionName = "Alert";
const version = "13.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const targetToken = workflow.targets.first();
        if (targetToken) {
            if (workflow.token.document.disposition !== targetToken.document.disposition) {
                return ui.notifications.error(`${optionName}: ${version} - not an ally`);;
            }

            let tokenCombatant = game.combat.getCombatantByToken(workflow.token.id);
            let targetCombatant = game.combat.getCombatantByToken(targetToken.id);
            if (tokenCombatant?.initiative === null || targetCombatant?.initiative === null ) {
                return ui.notifications.error(`${optionName}: ${version} - initiative not rolled`);;
            }

            let tokenInitiative = tokenCombatant.initiative;
            await tokenCombatant.update({initiative: targetCombatant.initiative});
            await targetCombatant.update({initiative: tokenInitiative});
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
