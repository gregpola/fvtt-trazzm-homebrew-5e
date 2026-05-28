/*
    Until the spell ends, sleet falls in a 40-foot-tall, 20-foot-radius Cylinder centered on a point you choose within
    range. The area is Heavily Obscured, and exposed flames in the area are doused.

    Ground in the Cylinder is Difficult Terrain. When a creature enters the Cylinder for the first time on a turn or
    starts its turn there, it must succeed on a Dexterity saving throw or have the Prone condition and lose Concentration.
*/
const optionName = "Sleet Storm";
const version = "14.5.0";
const summonUuid = "Compendium.fvtt-trazzm-homebrew-5e.trazzm-automation-actors-2024.Actor.ssItt0wEEut7Gd0t";

// Hooks.on('dnd5e.postSummon', dnd5eHook.postSummon);
try {
    if (args[0].macroPass === "preItemRoll") {
        Hooks.once('createRegion', _createTemplateDnD5e);

        // const template = await fromUuid(midiData.templateUuid);
        // if (template) {
        //     console.log(template);
        //     const shape = template.shapes[0];
        //     //shape.x, .y
        // }
    }

    /*
  Hooks.on("dnd5e.summonToken", (activity, profile, tokenData, options) => {
    if (!activity.friendlySummon) return;
    const caster = getTokenDocument(activity.actor);
    if (caster) tokenData.disposition = caster.disposition;

    // TODO add to concentration
  });

     */

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function _createTemplateDnD5e(templateDoc, context, userId) {
    console.log("CreateTemplateDnD5e");
}