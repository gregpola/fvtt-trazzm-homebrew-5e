const version = "12.4.0";
const optionName = "Change Shape (Giant Spider)";
const transformActorId = "Compendium.dnd-monster-manual.actors.Actor.mmGiantSpider000";

try {
    if ((args[0] === "on") && !actor.isPolymorphed) {
        let transformActor = await fromUuid(transformActorId);

        if (transformActor) {
            const keepParameters = { keepPhysical:false, keepMental:true, keepSaves:true, keepSkills:true,
                mergeSaves:true, mergeSkills:true, keepClass:true, keepFeats:true, keepSpells:true, keepItems:false,
                keepBio:true, keepVision:true, keepSelf:true, keepAE:true, keepOriginAE:true, keepOtherOriginAE:true,
                keepSpellAE:true, keepEquipmentAE:true, keepFeatAE:true, keepClassAE:true, keepBackgroundAE:true,
                transformTokens:true };

            return actor.transformInto(transformActor, keepParameters, {renderSheet:false});
        }
    }
    else if (args[0] === "off") {
        let originalActor = await actor.revertOriginalForm();

        // remove features
        let itemEffect = originalActor.effects.find(eff => eff.name === optionName);
        if (itemEffect) {
            await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: originalActor.uuid, effects: [itemEffect.id] });
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
