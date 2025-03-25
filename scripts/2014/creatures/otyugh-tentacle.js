/*
    Melee Weapon Attack: +6 to hit, reach 10 ft., one target. Hit: 7 (1d8 + 3) bludgeoning damage plus 4 (1d8) piercing
    damage. If the target is Medium or smaller, it is grappled (escape DC 13) and restrained until the grapple ends. The
    otyugh has two tentacles, each of which can grapple one target.
*/
const version = "12.3.0";
const optionName = "Tentacle";
const _flagGroup = "fvtt-trazzm-homebrew-5e";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const targetToken = workflow.hitTargets.first();
        if (targetToken) {
            // check the size
            const targetSize = targetToken.actor.system.traits.size;
            if (["tiny", "sm", "med"].includes(targetSize)) {
                // make sure the tentacle isn't already grappling
                let tendrilToken = canvas.tokens.placeables.find(t => t.actor.getRollData().effects.find(e => e.name === 'Grappled' && e.origin === item.uuid));

                if (tendrilToken) {
                    return ui.notifications.error(`${optionName}: ${version} - that tentacle is already grappling something`);
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

                    await HomebrewMacros.applyGrappled(token, targetToken, item, 13, undefined, true, additionalConditions);
                }
            }
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
