const version = "12.3.0";
const optionName = "Chikfari Bite";

try {
    if (args[0] === "on") {
        // check poison immunity
        const hasPoisonImmunity = actor.system.traits.di.value.has('poison');
        if (!hasPoisonImmunity) {
            await HomebrewEffects.applyPoisonedEffect(targetToken.actor, workflow.item.uuid, undefined, 3600);
        }
    }
    else if (args[0] === "off") {
        await HomebrewEffects.removeEffectByNameAndOrigin(actor, 'Poisoned', macroItem.uuid);
    }

}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
