/*
    While holding this magic weapon, you can take a Bonus Action and use a command word to cause flames to engulf the
    damage-dealing part of the weapon. These flames shed Bright Light in a 40-foot radius and Dim Light for an
    additional 40 feet. While the weapon is ablaze, it deals an extra 2d6 Fire damage on a hit. The flames last until
    you take a Bonus Action to issue the command again or until you drop, stow, or sheathe the weapon.
*/
const optionName = "Flame Tongue";
const version = "14.5.0";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _flagName = "flameTongueLight";

try {
    const ownerToken = await fromUuid(lastArgValue.tokenUuid);
    if (ownerToken) {
        if (args[0] === "on") {
            // save old lighting
            const updates = {};
            updates["flags.fvtt-trazzm-homebrew-5e.flameTongueLight"] = {
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
            updates["light.dim"] = 80;
            updates["light.bright"] = 40;
            updates["light.angle"] = 360;
            updates["light.alpha"] = 0.3;
            updates["light.coloration"] = 1;
            updates["light.color"] = "#F98026";
            updates["light.contrast"] = 0.5;
            updates["light.animation"] = "{'type': 'flame', 'speed': 5, 'intensity': 9, 'reverse': false}";

            await ownerToken.update(updates);

        }
        else if (args[0] === "off") {
            const updates = ownerToken.flags[_flagGroup].flameTongueLight;
            updates["flags.fvtt-trazzm-homebrew-5e.-=flameTongueLight"] = null;
            await ownerToken.update(updates)
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
