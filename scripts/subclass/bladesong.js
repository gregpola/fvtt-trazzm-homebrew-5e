/*
	Bladework. Whenever you attack with a weapon with which you have proficiency, you can use your Intelligence modifier
	for the attack and damage rolls instead of using Strength or Dexterity.
*/
const optionName = "Bladesong";
const version = "13.5.0";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "preAttackRoll") {
        const proficient = rolledItem?.system?.prof?.hasProficiency ?? false;

        if (rolledItem.type === 'weapon' && rolledActivity.type === 'attack' && proficient) {
            const currentAbility = rolledActivity.ability;
            const currentMod = actor.system.abilities[currentAbility].mod;
            const intMod = actor.system.abilities['int'].mod;

            if (intMod > currentMod) {
                workflow.activity.attack.ability = 'int';
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
