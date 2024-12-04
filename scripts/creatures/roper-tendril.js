/*
    Melee Weapon Attack: +7 to hit, reach 50 ft., one creature. Hit: The target is grappled (escape DC 15). Until the
    grapple ends, the target is restrained and has disadvantage on Strength checks and Strength saving throws, and the
    roper can't use the same tendril on another target.
*/
const version = "12.3.0";
const optionName = "Tendril";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const targetToken = workflow.hitTargets.first();
        if (targetToken) {
            // check the size diff
            if (HomebrewHelpers.isSizeEligibleForGrapple(token, targetToken)) {
                // make sure the tendril isn't already grappling
                let tendrilToken = canvas.tokens.placeables.find(t => t.actor.getRollData().effects.find(e => e.name === 'Grappled' && e.origin === item.uuid));

                if (tendrilToken) {
                    return ui.notifications.error(`${optionName}: ${version} - that tendril is already grappling something`);
                }
                else {
                    const additionalConditions = [
                        {
                            key: 'flags.midi-qol.disadvantage.ability.check.str',
                            mode: 0,
                            value: true,
                            priority: 30
                        },
                        {
                            key: 'flags.midi-qol.disadvantage.ability.save.str',
                            mode: 0,
                            value: true,
                            priority: 31
                        }
                    ];

                    await HomebrewMacros.applyGrappled(token, targetToken, item, 15, undefined, true, additionalConditions);
                }
            }
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
