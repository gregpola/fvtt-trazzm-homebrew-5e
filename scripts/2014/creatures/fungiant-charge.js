/*
    If the fungiant moves at least 20 feet straight toward the target and then hits it with a slam attack on the same
    turn, the fungiant can make a trample attack against the target as a free action. If the target is a creature, it
    must succeed on a DC 17 Strength saving throw or be knocked Prone.
*/
const version = "12.3.0";
const optionName = "Charge";

try {
    if (args[0].macroPass === "preItemRoll") {
        const targetToken = workflow.targets.first();
        if (targetToken) {
            // check target distance
            const targetDistance = MidiQOL.getDistance(token, targetToken, true);

            if (targetDistance < 20) {
                ui.notifications.error(`${optionName}: the target is not far enough away to charge`);
                return false;
            }

            await HomebrewMacros.chargeTarget(token, targetToken, 20);
        }
    }
    else if (args[0].macroPass === "postActiveEffects") {
        let targetToken = workflow.failedSaves.first();
        if (targetToken) {
            await HomebrewEffects.applyProneEffect(targetToken.actor, item.uuid);
        }

        targetToken = workflow.hitTargets.first();
        if (targetToken) {
            let trampleItem = actor.items.find(i => i.name === "Trample");
            if (trampleItem) {
                let [config, options] = HomebrewHelpers.syntheticItemWorkflowOptions();
                await MidiQOL.completeItemUse(trampleItem, config, options);
                await HomebrewMacros.wait(250);
            }
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
