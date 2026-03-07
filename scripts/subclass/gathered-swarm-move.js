/*
    The attack’s target must succeed on a Strength saving throw against your spell save DC or be moved by the swarm up
    to 15 feet horizontally in a direction of your choice.
*/
const optionName = "Gathered Swarm - Move";
const version = "13.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const targetToken = workflow.failedSaves.first();

        if (targetToken) {
            await new Portal()
                .color("#ff0000")
                .texture("icons/svg/target.svg")
                .origin(targetToken)
                .range(15)
                .teleport();

            let mightySwarm = actor.items.getName("Mighty Swarm");
            if (mightySwarm) {
                await targetToken.actor.toggleStatusEffect('prone', {active: true});
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
