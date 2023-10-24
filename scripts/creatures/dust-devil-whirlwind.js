/*
    Each creature in the dust devil's space must make a DC 13 Strength saving throw. On a failure, a target takes
    15 (3d8 + 2) bludgeoning damage and is flung up 20 feet away from the dust devil in a random direction and knocked
    prone. If a thrown target strikes an object, such as a wall or floor, the target takes 3 (1d6) bludgeoning damage for
    every 10 feet it was thrown. If the target is thrown at another creature, that creature must succeed on a DC 13
    Dexterity saving throw or take the same damage and be knocked prone.

    If the saving throw is successful, the target takes half the bludgeoning damage and isn't flung away or knocked prone.
*/
const version = "11.0";
const optionName = "Whirlwind";
const conditionName = "Prone";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let targets = workflow.failedSaves;
        if (targets && targets.size > 0) {
            for (let target of targets) {
                const hasEffectApplied = await game.dfreds.effectInterface.hasEffectApplied(conditionName, target.actor.uuid);
                if (!hasEffectApplied) {
                    await game.dfreds.effectInterface.addEffect({
                        'effectName': conditionName,
                        'uuid': target.actor.uuid,
                        'origin': workflow.origin,
                        'overlay': false
                    });
                }

                // fling away
                await HomebrewMacros.flingTarget(target, 4);
            }
        }

    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
