/*
    You learn the Chill Touch spell and can cast it without spell components. Necrotic damage you deal with this spell
    ignores Resistance.
 */
const optionName = "Touch of Death";
const version = "14.5.0";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "preDamageRoll") {
        if (rolledItem.type === "spell" && rolledItem.name === "Chill Touch") {
            let deathTouchEffect = macroItem.effects.getName("Death Touch");
            if (deathTouchEffect) {
                await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: actor.uuid, effects: [deathTouchEffect]});
            }
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
