/*
    Whenever you cast an Abjuration spell with a spell slot, the ward regains a number of Hit Points equal to twice the
    level of the spell slot. Alternatively, as a Bonus Action, you can expend a spell slot, and the ward regains a
    number of Hit Points equal to twice the level of the spell slot expended.
 */
const optionName = "Arcane Ward";
const version = "13.5.0";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _flagName = "arcane-ward-hp";

try {
    if (args[0].macroPass === "preItemRoll") {
        Hooks.once("dnd5e.postActivityConsumption", async(activity, usageConfig, messageConfig, updates) => {
            let slotLevel = 0;
            const wardFlag = actor.getFlag(_flagGroup, _flagName);

            // get the slot consumed
            const spellConsumption = updates?.actor.system?.spells;
            if (spellConsumption) {
                if (spellConsumption.spell1) {
                    slotLevel = 1;
                }
                else if (spellConsumption.spell2) {
                    slotLevel = 2;
                }
                else if (spellConsumption.spell3) {
                    slotLevel = 3;
                }
                else if (spellConsumption.spell4) {
                    slotLevel = 4;
                }
                else if (spellConsumption.spell5) {
                    slotLevel = 5;
                }
                else if (spellConsumption.spell6) {
                    slotLevel = 6;
                }
                else if (spellConsumption.spell7) {
                    slotLevel = 7;
                }
                else if (spellConsumption.spell8) {
                    slotLevel = 8;
                }
                else if (spellConsumption.spell9) {
                    slotLevel = 9;
                }
            }

            if (slotLevel > 0) {
                const wardHeal = slotLevel * 2;
                const newWardStrength = Math.min(wardFlag.max, wardFlag.current + wardHeal);
                await actor.setFlag(_flagGroup, _flagName, {max: wardFlag.max, current: newWardStrength});
                ChatMessage.create({
                    content: `${token.name}'s Arcane Ward gains ${wardHeal} hit points to ${newWardStrength} of ${wardFlag.max}`,
                    speaker: ChatMessage.getSpeaker({actor: actor})
                });
            }
        });
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
