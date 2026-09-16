/**
 * You can spend 15 feet of movement to teleport to an unoccupied space you can see within 15 feet of yourself. You can
 * use this benefit a number of times equal to your Proficiency Bonus but only once per turn, and you regain all
 * expended uses when you finish a Long Rest.
 */
const optionName = "Portal Jumper";
const version = "14.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        await new Portal()
            .color("#ff0000")
            .texture(token.document.texture.src)
            .origin(token)
            .range(15)
            .teleport();
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
