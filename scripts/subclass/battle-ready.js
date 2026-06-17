/*
    When you attack with a magic weapon, you can use your Intelligence modifier, instead of your Strength or Dexterity modifier, for the attack and damage rolls.
*/
const optionName = "Arcane Empowerment";
const version = "14.5.0";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "preAttackRollConfig") {
        // make sure it's a magic weapon
        if (rolledItem.type === "weapon" && rolledItem.system.properties.has("mgc")) {
            let weaponAbility = workflow.activity.attack.ability ?? 'str';
            let bestAbility = {ability: 'int', mod: actor.system.abilities.int.mod};

            if (rolledItem.system.properties.has('fin')) {
                if (actor.system.abilities.dex.mod > bestAbility.mod) {
                    bestAbility = {ability: 'dex', mod: actor.system.abilities.dex.mod};
                }
            }

            if (actor.system.abilities.str.mod > bestAbility.mod) {
                bestAbility = {ability: 'str', mod: actor.system.abilities.str.mod};
            }

            if (weaponAbility !== bestAbility.ability) {
                await workflow.activity.update({
                    "attack.ability": bestAbility.ability
                });
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
