/*
	Once on your turn, when you hit a creature that did not move on its last turn with a ranged weapon attack, that
	attack automatically becomes a critical hit.
*/
const optionName = "Sitting Duck";
const version = "14.5.0";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postAttackRoll") {
        const targetToken = workflow.hitTargets.first();
        if (targetToken && workflow.activity.actionType === 'rwak') {
            // check last turn movement
            const lastTurnMove = targetToken.document.movement?.passed?.distance ?? 0;
            if (lastTurnMove === 0) {
                const activity = macroItem.system.activities.find(a => a.identifier === 'apply-sitting-duck');
                if (activity) {
                    await activity.use();
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
