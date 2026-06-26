/*
    Ominous Strikes. When you hit a creature that has the Frightened condition with an attack roll, that attack deals extra damage equal to your Wisdom modifier.
*/
const version = "14.5.0";
const optionName = "Ancient Might";

try {
    const targetToken = workflow.hitTargets.first();
    if (args[0].macroPass === "DamageBonus" && targetToken) {
        let actorEffects = Array.from(targetToken.actor.allApplicableEffects());
        let frightenedEffects = actorEffects.filter(s => s.statuses.has('frightened'));

        if (frightenedEffects.length > 0) {
            const abilityBonus = actor.system.abilities.wis.mod;
            return new CONFIG.Dice.DamageRoll(`+${abilityBonus}[${optionName}]`, {}, {type:workflow.defaultDamageType, properties: [...rolledItem.system.properties]});
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
