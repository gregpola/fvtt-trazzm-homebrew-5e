/**
 * This macro handles special Hunter's Mark features.
 *
 */
const optionName = "Hunter's Mark";
const version = "14.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        // check for special features
        const huntersRime = actor.items.getName("Hunter’s Rime");
        if (huntersRime) {
            let activity = await huntersRime.system.activities.getName("Heal");
            if (activity) {
                await activity.use();
            }
        }

        const frozenHaunt = actor.items.getName("Frozen Haunt");
        if (frozenHaunt) {
            let activity = await frozenHaunt.system.activities.getName("Use");
            if (activity) {
                await activity.use();
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
