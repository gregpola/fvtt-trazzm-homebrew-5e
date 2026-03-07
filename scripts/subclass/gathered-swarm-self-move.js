const optionName = "Gathered Swarm - Self Move";
const version = "13.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        await new Portal()
            .color("#ff0000")
            .texture("icons/svg/target.svg")
            .origin(token)
            .range(5)
            .teleport();

        let mightySwarm = actor.items.getName("Mighty Swarm");
        if (mightySwarm) {
            // half cover one turn
            await HomebrewEffects.applyHalfCoverEffect(actor, ['turnStart']);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
