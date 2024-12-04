const version = "12.3.0";
const optionName = "Revert Wild Shape";
const wildShapeName = "Wild Shape";

try {
    if (args[0].macroPass === "postActiveEffects") {
        if (actor.isPolymorphed) {
            let originalActor = await actor.revertOriginalForm();
            if (originalActor) {
                let itemEffect = HomebrewHelpers.findEffect(originalActor, wildShapeName);
                if (itemEffect) {
                    await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: originalActor.uuid, effects: [itemEffect.id] });
                }

                let wildShapeFeature = actor.items.find(i => i.name === "Revert Wild Shape");
                if (wildShapeFeature) {
                    wildShapeFeature.delete();
                }

                wildShapeFeature = actor.items.find(i => i.name === "Wild Shape Healing");
                if (wildShapeFeature) {
                    wildShapeFeature.delete();
                }

                // TODO maybe token changes???
            }
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
