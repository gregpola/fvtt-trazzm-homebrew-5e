/*
    If the vvor moves at least 20 feet straight toward a target and then hits it with a tusk attack on the same turn,
    the target takes an extra 10 (3d6) slashing damage. If the target is a creature, it must succeed on a DC 14 Strength
    saving throw or be knocked prone.
*/
const version = "12.3.0";
const optionName = "Charge";

try {
    if (args[0].macroPass === "preItemRoll") {
        const targetToken = workflow.targets.first();
        if (targetToken) {
            // check target distance
            const actorMove = actor.system.attributes.movement.walk ?? 0;
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
