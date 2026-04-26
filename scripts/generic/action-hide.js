const version = "13.5.0";
const optionName = "Hide Action";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let hidingEffect = HomebrewHelpers.findEffect(actor, "Hiding");
        if (hidingEffect) {
            let rawStealthValue = foundry.utils.getProperty(hidingEffect, 'flags.stealthy.stealth');
            let stealthValue = Number(rawStealthValue ?? 0);
            if (stealthValue < 15) {
                await MidiQOL.socket().executeAsGM('removeEffects', {
                    'actorUuid': actor.uuid,
                    'effects': [hidingEffect.id]
                });
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

