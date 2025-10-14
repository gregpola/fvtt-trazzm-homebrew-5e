/*
    You infect up to three creatures you can see within range with a magical disease. At the start of each of the
    target’s turns, it must make a Constitution saving throw. On a failed saving throw, the creature takes 3d6 necrotic
    damage and gains 1 level of exhaustion. If a target succeeds on three of these saves, the spell ends for that creature.
 */
const optionName = "Pestilence";
const version = "13.5.0";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _flagName = "pestilence-flag";
const effectName = "Pestilence";

try {
    if (args[0].macroPass === "postActiveEffects") {
        // check made saves
        let targetToken = workflow.saves.first();
        if (targetToken) {
            let flag = actor.getFlag(_flagGroup, _flagName);
            if (flag) {
                if (flag.count === 2) {
                    await HomebrewEffects.removeEffectByName(targetToken.actor, effectName);
                    await actor.unsetFlag(_flagGroup, _flagName);
                }
                else {
                    const newCount = flag.count + 1;
                    await actor.setFlag(_flagGroup, _flagName, {count: newCount});
                }
            }
            else {
                await actor.setFlag(_flagGroup, _flagName, {count: 1});
            }
        }

        // check failures
        targetToken = workflow.failedSaves.first();
        if (targetToken) {
            let currentExhaustion = targetToken.actor.system.attributes.exhaustion ?? 0;
            await targetToken.actor.update({"system.attributes.exhaustion": currentExhaustion + 1});
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
