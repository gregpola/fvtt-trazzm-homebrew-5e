const version = "12.3.0";
const optionName = "Spirit Totem Move";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "spirit-totem";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const tokenId = actor.getFlag(_flagGroup, flagName);
        if (tokenId) {
            const spiritToken = await fromUuid(tokenId);
            if (spiritToken) {
                await HomebrewMacros.teleportToken(spiritToken, 60);
            }
            else {
                ui.notifications.error(`${optionName}: ${version} - missing token`);
            }
        }
        else {
            ui.notifications.error(`${optionName}: ${version} - missing token flag`);
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
