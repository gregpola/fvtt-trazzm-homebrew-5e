/*
    When you cast Eldritch Blast, add your Charisma modifier to the damage it deals on a hit.
*/
const version = "11.0";
const optionName = "Agonizing Blast";

try {
    if (args[0].macroPass === "DamageBonus") {
        if (["spell"].includes(workflow.item.type) && workflow.item.name === "Eldritch Blast") {
            const spellcastingAbility = actor.system.attributes.spellcasting;
            const abilityBonus = actor.system.abilities[spellcastingAbility].mod;
            return {damageRoll: `${abilityBonus}[force]`, flavor: optionName};
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
