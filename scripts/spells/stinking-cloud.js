/*
    You create a 20-foot-radius Sphere of yellow, nauseating gas centered on a point within range. The cloud is Heavily
    Obscured. The cloud lingers in the air for the duration or until a strong wind (such as the one created by Gust of
    Wind) disperses it.

    Each creature that starts its turn in the Sphere must succeed on a Constitution saving throw or have the Poisoned
    condition until the end of the current turn. While Poisoned in this way, the creature can’t take an action or a
    Bonus Action.
 */
const version = "14.5.0";
const optionName = "Stinking Cloud";

try {
    if (args[0].macroPass === "postActiveEffects") {
    }
    else if (args[0] === "off") {
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
