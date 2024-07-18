/*
    At the start of your first turn of each combat, your walking speed increases by 10 feet, which lasts until the end
    of that turn. If you take the Attack action on that turn, you can make one additional weapon attack as part of that
    action. If that attack hits, the target takes an extra 1d8 damage of the weapon’s damage type.
*/
const version = "11.1";
const optionName = "Dread Ambusher";

// apply to 'On Combat Starting' effect macro, reverse in an 'On Combat Ending' effect macro
let effect = actor.effects.find(ef => ef.name === "Dread Ambusher - Movement Bonus");
if (effect) {
    await effect.update({'disabled': false});
}

effect = actor.effects.find(ef => ef.name === "Dread Ambusher - Bonus Damage");
if (effect) {
    await effect.update({'disabled': false});
}
