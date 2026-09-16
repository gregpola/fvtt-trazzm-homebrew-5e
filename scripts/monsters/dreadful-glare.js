/**
 * Success: The target is immune to this mummy's Dreadful Glare for 24 hours.
 */
const optionName = "Dreadful Glare";
const version = "14.5.0";
const immunityEffect = "Dreadful Glare Immunity";

try {
    const targetToken = workflow.targets.first();
    if (targetToken) {
        if (args[0].macroPass === "preItemRoll") {
            // check for immunity
            if (hasImmunity(targetToken.actor, macroItem)) {
                ui.notifications.error(`${optionName}: ${targetToken.name} has immunity`);
                return false;
            }

        } else if (args[0].macroPass === "postActiveEffects") {
            const successTarget = workflow.saves.first();
            if (successTarget) {
                await addImmunity(successTarget);
            }
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function addImmunity(targetToken) {
    const targetUuids = [targetToken.document.uuid];
    const activity = macroItem.system.activities.getName("Apply Immunity");
    if (activity) await MidiQOL.completeActivityUse(activity, { midiOptions: { targetUuids } });
}

function hasImmunity(targetActor, macroItem) {
    return targetActor.effects?.find(ef => ef.name === immunityEffect && ef.origin.startsWith(macroItem.uuid));
}
