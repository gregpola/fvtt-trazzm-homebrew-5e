/*
    When you make a ranged weapon attack against a creature, you gain advantage on the attack roll if there are no other
    creatures within 5 feet of that target, or if you are 20 feet or more above the target and that creature doesn’t have cover.
*/
const version = "14.5.0";
const optionName = "Vantage Point";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "preAttackRoll") {
        const targetToken = workflow.targets.first();
        if (targetToken && workflow.activity.actionType === 'rwak') {
            var grantAdvantage = false;

            // check elevation diff
            const actorElevation = token.document.elevation;
            const targetElevation = targetToken.document.elevation;
            grantAdvantage = ((actorElevation - targetElevation) >= 20);


            // check nearby target
            if (!grantAdvantage) {
                const withinRange = MidiQOL.findNearbyCount(null, targetToken, 5);
                grantAdvantage = withinRange === 0;
            }

            if (grantAdvantage) {
                workflow.advantage = true;

                // check for Perfect Position
                const perfectPosition = actor.items.find(i => i.name === "Perfect Position");
                if (perfectPosition) {
                    const activity = macroItem.system.activities.find(a => a.identifier === 'apply-perfect-position');
                    if (activity) {
                        await activity.use();
                    }
                }
            }
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
