/*
    Each creature in the elemental's space must make a DC 15 Strength saving throw. On a failure, a target takes 13 (2d8 + 4)
    bludgeoning damage. If it is Large or smaller, it is also grappled (escape DC 14). Until this grapple ends, the
    target is restrained and unable to breathe unless it can breathe water. If the saving throw is successful, the target
    is pushed out of the elemental's space.

    The elemental can grapple one Large creature or up to two Medium or smaller creatures at one time. At the start of
    each of the elemental's turns, each target grappled by it takes 13 (2d8 + 4) bludgeoning damage. A creature within 5
    feet of the elemental can pull a creature or object out of it by taking an action to make a DC 14 Strength check and succeeding.
*/
const version = "12.3.0";
const optionName = "Whelm";
const overtimeEffect = "turn=end, damageRoll=2d8+4, damageType=bludgeoning, label=Whelm";

try {
    if (args[0].macroPass === "postActiveEffects") {
        // failures
        for (let failedTarget of workflow.failedSaves) {
            const tsize = failedTarget.actor.system.traits.size;
            if (["tiny","sm","med","lg"].includes(tsize)) {
                let grappled = await HomebrewMacros.applyGrappled(token, failedTarget, item, 14, flagName, overtimeEffect, true);
                ChatMessage.create({
                    content: `${token.name} grapples ${failedTarget.name} whom is unable to breath`,
                    speaker: ChatMessage.getSpeaker({ actor: actor })});
            }
        }

        // Successes
        for (let savedTarget of workflow.saves) {
            await HomebrewMacros.flingTarget(savedTarget, 2);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
