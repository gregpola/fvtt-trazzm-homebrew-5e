/*
    While holding this magic weapon, you can take a Bonus Action and use a command word to cause electricity to engulf
    the damage-dealing part of the weapon. These bolts shed Bright Light in a 20-foot radius and Dim Light for an
    additional 20 feet. While the weapon is electrified, it deals an extra 2d6 Lightning damage on a hit. The bolts last
    until you take a Bonus Action to issue the command again or until you drop, stow, or sheathe the weapon.
*/
const optionName = "Lightning Blade";
const version = "14.5.0";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _flagName = "lightningBladeLight";

try {
    const ownerToken = await fromUuid(lastArgValue.tokenUuid);
    if (ownerToken) {
        if (args[0] === "on") {
            // save old lighting
            const updates = {};
            updates["flags.fvtt-trazzm-homebrew-5e.lightningBladeLight"] = {
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
            updates["light.color"] = "#0a51eb";
            updates["light.contrast"] = 1.0;
            updates["light.animation"] = "{'type': 'energy', 'speed': 10, 'intensity': 10, 'reverse': false}";

            await ownerToken.update(updates);

        }
        else if (args[0] === "off") {
            const updates = ownerToken.flags[_flagGroup].lightningBladeLight;
            updates["flags.fvtt-trazzm-homebrew-5e.-=lightningBladeLight"] = null;
            await ownerToken.update(updates)
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
