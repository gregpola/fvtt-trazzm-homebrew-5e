/*
    In addition, whenever you cast Misty Step, you can bring along one willing creature you can see within 5 feet of
    yourself. That creature teleports to an unoccupied space of your choice within 5 feet of your destination space.
*/
const optionName = "Misty Wanderer";
const version = "12.4.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        if (macroActivity && macroActivity.targets) {
            let targetToken = macroActivity.targets.first();
            if (targetToken) {
                // get the position
                let position = await new Portal()
                    .color("#ff0000")
                    .texture("icons/svg/target.svg")
                    .origin(token)
                    .range(5)
                    .pick();

                // teleport the token
                await new Portal()
                    .setLocation(position)
                    .origin(targetToken)
                    .teleport();
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
