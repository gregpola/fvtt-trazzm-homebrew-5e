/*
    You inflict a creature you can see within range with a magical disease. At the start of each of the target’s turns,
    it must make a Constitution saving throw. The creature takes 1d12 necrotic damage on a failed saving throw, or half
    as much on a successful one. If a target succeeds on three of these saves, the spell ends.
*/
const optionName = "Infect";
const version = "13.5.0";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _flagName = "infect-flag";
const effectName = "Infected";

try {
    if (args[0].macroPass === "postActiveEffects") {
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
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
