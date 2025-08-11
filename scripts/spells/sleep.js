/*
    Each creature of your choice in a 5-foot-radius Sphere centered on a point within range must succeed on a Wisdom
    saving throw or have the Incapacitated condition until the end of its next turn, at which point it must repeat the
    save. If the target fails the second save, the target has the Unconscious condition for the duration. The spell ends
    on a target if it takes damage or someone within 5 feet of it takes an action to shake it out of the spell’s effect.

    Creatures that don’t sleep, such as elves, or that have Immunity to the Exhaustion condition automatically succeed
    on saves against this spell.
*/
const optionName = "Sleep";
const version = "12.4.1";

try {
    if (args[0] === "each" && lastArgValue.turn === 'endTurn') {
        if (!(actor.system.traits.ci.custom.includes("Magical Sleep") || actor.system.traits.ci.value.has("exhaustion"))) {
            const dc = macroItem.parent.system.attributes.spell.dc;
            const config = { undefined, ability: "wis", target: dc };
            const dialog = {};
            const message = { data: { speaker: ChatMessage.implementation.getSpeaker({ actor: actor }) } };
            let saveResult = await actor.rollSavingThrow(config, dialog, message);
            if (!saveResult[0].isSuccess) {
                // get duration in seconds
                const duration = HomebrewHelpers.itemDurationSeconds(macroItem);
                await HomebrewEffects.applySleepingEffect2024(actor, macroItem, ['isDamaged', 'endCombat'], duration);
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
