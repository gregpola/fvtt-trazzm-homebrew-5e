/*
    You emit a baleful aura which disorients creatures who approach you. Any creatures that start their turn within
    10 feet of you are poisoned until the start of their next turn.
 */
const optionName = "Venomous Aura";
const version = "14.5.0";


try {
    if (args[0] === "each" && lastArgValue.turn === 'startTurn') {
        // apply poisoned
        // get the effect from the item
        const effect = macroItem.effects.getName('Venomous Aura Poisoned');
        if ( effect) {
            const hasPoisonImmunity = actor.system.traits.ci.value.has('poisoned');
            if (!hasPoisonImmunity) {
                await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: actor.uuid, effects: [effect]});
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
