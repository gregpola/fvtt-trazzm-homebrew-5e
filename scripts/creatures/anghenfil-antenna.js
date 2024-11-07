const version = "12.3.0";
const optionName = "Anghenfil Whipping Antennae";
const escapeDC = 16;

try {
    if (args[0].macroPass === "preItemRoll") {
        let antennaeToken = canvas.tokens.placeables.find(t => t.actor.getRollData().effects.find(e => e.name === 'Grappled' && e.origin === item.uuid));
        if (antennaeToken) {
            ui.notifications.error(`${optionName}: ${version} - that antennae is already grappling something`);
            return false;
        }

        return true;
    }
    else if (args[0].macroPass === "postActiveEffects") {
        const targetToken = workflow.hitTargets.first();
        if (targetToken) {
            // check the size diff
            if (HomebrewHelpers.isSizeEligibleForGrapple(token, targetToken)) {
                await HomebrewMacros.applyGrappled(token, targetToken, item, escapeDC, undefined, true);
                await HomebrewMacros.pullTarget(token, targetToken, 3);
            }
        }
    }
} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
