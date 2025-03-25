const version = "12.3.0";
const optionName = "Protection from Poison";

try {
    if (args[0].macroPass === "postActiveEffects") {
        for (let targetToken of workflow.targets) {
            const effects = targetToken.actor.effects.filter(i => i.name === "Poisoned");
            if (effects.length > 0) {
                await MidiQOL.socket().executeAsGM("removeEffects", {
                    actorUuid: targetToken.actor.uuid,
                    effects: [effects[0].id]
                });
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
