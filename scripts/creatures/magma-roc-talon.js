/*
    Melee Weapon Attack: +9 to hit, reach 5 ft., one target. Hit: 26 (6d6 + 5) slashing damage plus 1d6 fire damage, and
    the target is Grappled (escape DC 16). Until this grapple ends, the target is Restrained, and the roc can't use its
    talons on another target.
*/
const version = "12.3.0";
const optionName = "Talons";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const targetToken = workflow.hitTargets.first();
        if (targetToken) {
            // make sure the talon isn't already grappling
            let talonToken = canvas.tokens.placeables.find(t => t.actor.getRollData().effects.find(e => e.name === 'Grappled' && e.origin === item.uuid));
            if (talonToken) {
                return ui.notifications.error(`${optionName}: ${version} - the talons are already grappling ${talonToken.name}`);
            }
            else {
                await HomebrewMacros.applyGrappled(token, targetToken, item, 16, undefined, true);
            }
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
