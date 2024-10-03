const version = "12.3.0";
const optionName = "Wake Up";

try {
    const targetToken = workflow.targets.first();

    // validate that the target can be woken
    const currentHP = targetToken.actor?.system.attributes.hp.value ?? 1;
    if (currentHP > 0) {
        //await targetToken.actor.toggleStatusEffect('sleeping', { overlay: true, active: false });
        let sleepingEffect = await targetToken.actor.appliedEffects.find(e=>e.name === "Sleeping");
        if (sleepingEffect) {
            await MidiQOL.socket().executeAsGM('removeEffects', {actorUuid: targetToken.actor.uuid, effects: [sleepingEffect.id]});
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
