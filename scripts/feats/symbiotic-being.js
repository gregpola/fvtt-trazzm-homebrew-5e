let activity = await macroItem.system.activities.getName("Sustained Symbiosis");
if (activity) {
    let result = await activity.use();
    return result?.message?.flags['midi-qol']?.utilityRolls[0]?.total ?? 0;
}
