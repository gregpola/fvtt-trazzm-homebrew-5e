/*
    You place a curse on a creature that you can see within range. Until the spell ends, you deal an extra 1d6 Necrotic
    damage to the target whenever you hit it with an attack roll. Also, choose one ability when you cast the spell. The
    target has Disadvantage on ability checks made with the chosen ability.

    If the target drops to 0 Hit Points before this spell ends, you can take a Bonus Action on a later turn to curse a new creature.
*/
const version = "13.5.0";
const optionName = "Hex - Move Curse";

try {
    if (args[0].macroPass === "preItemRoll") {
        // check for existing target
        let existingConcentration = MidiQOL.getConcentrationEffect(actor, macroItem);
        if (existingConcentration) {
            let dependents = existingConcentration.getDependents();
            if (dependents.length > 0) {
                const effect = dependents[0];
                if (effect.target.system.attributes.hp.value > 0) {
                    ui.notifications.error(`${optionName}: ${version} - current Hex target is not dead`);
                    return false;
                }
            }
        }
        else {
            ui.notifications.error(`${optionName}: ${version} - not maintaining Hex`);
            return false;
        }

        return true;
    }
    else if (args[0].macroPass === "postActiveEffects") {
        let targetToken = workflow.targets.first();
        if (targetToken) {
            // get the new Hex effect and add it to the source actor's concentration
            let existingConcentration = MidiQOL.getConcentrationEffect(actor, macroItem);
            if (existingConcentration) {
                // remove the old Hex effect
                let effects = existingConcentration.getDependents();
                if (effects.length > 0) {
                    const dependentToRemove = effects.find((effect) => effect.target.system.attributes.hp.value < 1);
                    if (dependentToRemove) {
                        const oldActor = dependentToRemove.target;
                        const actorEffect = HomebrewHelpers.findEffectStartsWith(oldActor, 'Hexed ');
                        if (actorEffect) {
                            MidiQOL.socket().executeAsGM("removeEffects", {actorUuid: oldActor.uuid, effects: [actorEffect.id]});
                        }
                    }
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
