/*
    You can cast spells as though you were in the companion’s space, but you must use your own senses.

    Once per turn, when you cast an Artificer spell from the Evocation or Necromancy school and deal damage while your
    companion is within 120 feet of you, you can add your Intelligence modifier to one damage roll of that spell.
*/
const optionName = "Arcane Conduit";
const version = "14.5.0";
const eligibleSchools = ["evo", "nec"];
const timeFlag = "last-arcane-conduit";

try {
    if (args[0].macroPass === "DamageBonus" && workflow.hitTargets.size) {
        // meet the spell requirements
        if (rolledItem.type === "spell" && rolledItem.system.sourceClass === "artificer" && eligibleSchools.includes(rolledItem.system.school)) {
            // per turn check
            if (HomebrewHelpers.perTurnCheck(actor, timeFlag)) {
                const companion = actor.summonedCreatures.find(s => s.name === 'Reanimated Companion')
                if (companion) {
                    const companionToken = MidiQOL.tokenForActor(companion);
                    if (companionToken) {
                        const tokenDistance = MidiQOL.computeDistance(token, companionToken);
                        if (tokenDistance <= 120) {
                            await HomebrewHelpers.setTurnCheck(actor, timeFlag);
                            const intMod = actor.system.abilities.int.mod;
                            return new CONFIG.Dice.DamageRoll(`${intMod}[${optionName}]`, {}, {type: workflow.defaultDamageType, properties: [...rolledItem.system.properties]});
                        }
                    }
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
