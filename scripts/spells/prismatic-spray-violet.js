const optionName = "Prismatic Spray - Violet Second Save Trigger";
const version = "14.5.0";

try {
    if (args[0] === "off") {
        // end of casters turn, trigger the secondary save
        // get all the tokens with the violet effect
        let targetToUse = [];

        for (let targetToken of canvas.tokens.placeables) {
            let hasEffect = await HomebrewEffects.findEffectBySourceActor(targetToken.actor, "Violet Ray", actor);
            if (hasEffect) {
                targetToUse.push(targetToken);
            }
        }

        if (targetToUse.length) {
            const triggerActivity = await macroItem.system.activities.find(a => a.identifier === 'violet-ray-second-save');
            if (triggerActivity) {
                const targetUuids = targetToUse.map(t => t.document.uuid);
                await MidiQOL.completeActivityUse(triggerActivity, {midiOptions: {targetUuids}});
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
