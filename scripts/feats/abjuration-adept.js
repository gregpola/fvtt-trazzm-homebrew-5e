/**
 * Protective Ward. When you cast a spell from the Abjuration school using a spell slot, you or one creature you can see
 * within 30 feet of yourself gains Temporary Hit Points equal to twice the level of spell slot expended.
 */
const optionName = "Abjuration Adept";
const version = "14.5.0";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postActiveEffects" && rolledItem.type === "spell" && rolledItem.system.school === "abj") {
        const spellLevel = workflow.castData.castLevel;

        // make sure it was cast using a spell slot???
        if (spellLevel > 0 && rolledActivity.consumption?.spellSlot) {
            const potentialTargets = await MidiQOL.findNearby([CONST.TOKEN_DISPOSITIONS.FRIENDLY, CONST.TOKEN_DISPOSITIONS.NEUTRAL], token, 30, {
                canSee: true,
                includeToken: true
            });
            const secondaryTarget = await HomebrewHelpers.pickTarget(potentialTargets, `${optionName} - select target to receive tempHP:`)
            if (secondaryTarget) {
                const targetUuids = [secondaryTarget.document.uuid];
                const activity = macroItem.system.activities.getName("Protective Ward");
                if (activity) {
                    const healAmount = 2 * spellLevel;
                    await activity.update({"healing.custom.formula" : healAmount.toString()});
                    await MidiQOL.completeActivityUse(activity, { midiOptions: { targetUuids } });
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
