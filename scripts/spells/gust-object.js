/*
    One Medium or smaller creature that you choose must succeed on a Strength saving throw or be pushed up to 5 feet away from you.
*/
const optionName = "Gust - Push";
const version = "12.4.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let targetToken = macroActivity.targets.first();
        if (["tiny", "sm", "med"].includes(targetToken.actor.system.traits.size)) {
            await anime(token, targetToken);
            await HomebrewMacros.pushTarget(token, targetToken, 1);
        }
        else {
            ui.notifications.error(`${optionName} - ${targetToken.name} is too big to push`);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function anime(token, target) {
    new Sequence()
        .effect()
        .file("jb2a.gust_of_wind.default")
        .atLocation(token)
        .stretchTo(target)
        .play()
}
