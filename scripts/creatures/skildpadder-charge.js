/*
    If the skildpadder moves at least 20 feet straight toward a creature and then hits it with a slam attack on the same
    turn, that target must succeed on a DC 22 Strength saving throw or be knocked Prone. If the target is prone, the
    skildpadder can make one stomp attack against it as a bonus action.
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
        const targetToken = workflow.failedSaves.first();
        if (targetToken) {
            await HomebrewEffects.applyProneEffect(targetToken.actor, item.uuid);
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
