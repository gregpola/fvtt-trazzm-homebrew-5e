/*
    While holding it, you can take a Bonus Action to cause it to shed Bright Light in a 30-foot radius and Dim Light for
    an additional 30 feet. You can extinguish the light as a Bonus Action.
*/
const optionName = "Dazzling Weapon Light";
const version = "14.5.0";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _flagName = "dazzlingWeaponLight";

try {
    const ownerToken = await fromUuid(lastArgValue.tokenUuid);
    if (ownerToken) {
        if (args[0] === "on") {
            // save old lighting
            const updates = {};
            updates["flags.fvtt-trazzm-homebrew-5e.dazzlingWeaponLight"] = {
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
            updates["light.dim"] = 60;
            updates["light.bright"] = 30;
            updates["light.angle"] = 360;
            updates["light.alpha"] = 0.3;
            updates["light.coloration"] = 1;
            updates["light.color"] = "#d5cc7a";
            updates["light.contrast"] = 0.5;
            updates["light.animation"] = "{'type': 'flame', 'speed': 5, 'intensity': 5, 'reverse': false}";

            await ownerToken.update(updates);

        }
        else if (args[0] === "off") {
            const updates = ownerToken.flags[_flagGroup].dazzlingWeaponLight;
            updates["flags.fvtt-trazzm-homebrew-5e.-=dazzlingWeaponLight"] = null;
            await ownerToken.update(updates)
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
