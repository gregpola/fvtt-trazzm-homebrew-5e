/*
    When you drink this potion, it cures any disease afflicting you, and it removes the Blinded, Deafened, Paralyzed,
    and Poisoned conditions. The clear red liquid has tiny bubbles of light in it.
*/
const version = "11.0";
const optionName = "Elixir of Health";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let targetToken = workflow.targets.first();

        if (targetToken) {
            // look for applicable effects to remove
            let effect = targetToken.actor.effects.find(i => i.name === "Diseased");
            while (effect) {
                await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: targetToken.actor.uuid, effects: [effect.id] });
                effect = targetToken.actor.effects.find(i => i.name === "Diseased");
            }

            effect = targetToken.actor.effects.find(i => i.name === "Blinded");
            while (effect) {
                await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: targetToken.actor.uuid, effects: [effect.id] });
                effect = targetToken.actor.effects.find(i => i.name === "Blinded");
            }

            effect = targetToken.actor.effects.find(i => i.name === "Deafened");
            while (effect) {
                await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: targetToken.actor.uuid, effects: [effect.id] });
                effect = targetToken.actor.effects.find(i => i.name === "Deafened");
            }

            effect = targetToken.actor.effects.find(i => i.name === "Paralyzed");
            while (effect) {
                await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: targetToken.actor.uuid, effects: [effect.id] });
                effect = targetToken.actor.effects.find(i => i.name === "Paralyzed");
            }

            effect = targetToken.actor.effects.find(i => i.name === "Poisoned");
            while (effect) {
                await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: targetToken.actor.uuid, effects: [effect.id] });
                effect = targetToken.actor.effects.find(i => i.name === "Poisoned");
            }

            ChatMessage.create({
                content: `${actor.name} administers an ${optionName} to ${targetToken.name}. (DM may have to manually remove some effects)`,
                speaker: ChatMessage.getSpeaker({actor: actor})
            });
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
