/*
    A generic item macro for removing ambient light added to a template item
*/
const optionName = "Remove Ambient Light";
const version = "13.5.0";

try {
    if (args[0] === "off") {
        // TODO update the 'FogCloud' value to match the item
        await game.trazzm.socket.executeAsGM("removeAmbientLight", 'FogCloud', actor);
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
