/*
    A Torch burns for 1 hour, casting Bright Light in a 20-foot radius and Dim Light for an additional 20 feet.

    When you take the Attack action, you can attack with the Torch, using it as a Simple Melee weapon. On a hit, the target takes 1d4 Fire damage.
*/
const optionName = "Torch";
const version = "14.5.0";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _flagName = "torchLight";

try {
    const ownerToken = await fromUuid(lastArgValue.tokenUuid);
    if (ownerToken) {
        if (args[0] === "on") {
            // save old lighting
            const updates = {};
            updates["flags.fvtt-trazzm-homebrew-5e.torchLight"] = {
                "light.dim": ownerToken._source.light.dim,
                "light.bright": ownerToken._source.light.bright,
                "light.angle": ownerToken._source.light.angle,
                "light.alpha": ownerToken._source.light.alpha,
                "light.coloration": ownerToken._source.light.coloration,
                "light.color": ownerToken._source.light.color,
                "light.contrast": ownerToken._source.light.contrast,
                "light.animation": ownerToken._source.light.animation
            };

            // apply new lighting
            updates["light.dim"] = 40;
            updates["light.bright"] = 20;
            updates["light.angle"] = 360;
            updates["light.alpha"] = 0.3;
            updates["light.coloration"] = 1;
            updates["light.color"] = "#F98026";
            updates["light.contrast"] = 0.5;
            updates["light.animation"] = "{'type': 'flame', 'speed': 5, 'intensity': 5, 'reverse': false}";

            await ownerToken.update(updates);

        }
        else if (args[0] === "off") {
            const updates = ownerToken.flags[_flagGroup].torchLight;
            updates["flags.fvtt-trazzm-homebrew-5e.-=torchLight"] = null;
            await ownerToken.update(updates)
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
