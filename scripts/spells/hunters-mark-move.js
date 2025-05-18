/*
    You magically mark one creature you can see within range as your quarry. Until the spell ends, you deal an extra 1d6
    Force damage to the target whenever you hit it with an attack roll. You also have Advantage on any
    Wisdom (Perception) or Wisdom (Survival) check you make to find it.

    If the target drops to 0 Hit Points before this spell ends, you can take a Bonus Action to move the mark to a new
    creature you can see within range.

    Using a Higher-Level Spell Slot. Your Concentration can last longer with a spell slot of level 3–4 (up to 8 hours)
    or 5+ (up to 24 hours).
*/
const version = "12.4.0";
const optionName = "Hunters Mark - Move";

try {
    if (args[0].macroPass === "preItemRoll") {
        // check for existing target
        let existingConcentration = MidiQOL.getConcentrationEffect(actor, macroItem);
        if (existingConcentration) {
            let dependents = existingConcentration.getDependents();
            if (dependents.length > 0) {
                const effect = dependents[0];
                if (effect.target.system.attributes.hp.value > 0) {
                    ui.notifications.error(`${optionName}: ${version} - current target is not dead`);
                    return false;
                }
            }
        }
        else {
            ui.notifications.error(`${optionName}: ${version} - not maintaining Hunters Mark`);
            return false;
        }

        return true;
    }
    else if (args[0].macroPass === "postActiveEffects") {
        let targetToken = workflow.targets.first();
        if (targetToken) {
            // get the new effect and add it to the source actor's concentration
            let existingConcentration = MidiQOL.getConcentrationEffect(actor, macroItem);
            if (existingConcentration) {
                const markedEffect = targetToken.actor.effects.find(eff => eff.name === 'Hunters Marked' && eff.origin.startsWith(actor.uuid));
                if (markedEffect) {
                    await MidiQOL.socket().executeAsGM('addDependent', {documentUuid: existingConcentration.uuid, concentrationEffectUuid: existingConcentration.uuid, dependentUuid: markedEffect.uuid});
                }

                // remove the old Hex effect
                let dependents = existingConcentration.getDependents();
                if (dependents.length > 0) {
                    const oldActor = dependents[0].target;
                    await MidiQOL.socket().executeAsGM("removeEffects", {actorUuid: oldActor.uuid, effects: [dependents[0].id]});
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
