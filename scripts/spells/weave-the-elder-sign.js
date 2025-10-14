/*
    The spell ends for a stunned creature if it takes any damage, or if someone else uses an action to shake the
    creature out of its stupor. When the spell ends for a stunned creature, it takes 3d6 psychic damage.
 */
const damageType = 'psychic';
let damageRoll = await new CONFIG.Dice.DamageRoll('3d6', {}, {type: damageType}).evaluate();
await MidiQOL.displayDSNForRoll([damageRoll], "damageRoll");
await MidiQOL.applyTokenDamage(
    [{ damage: damageRoll.total, type: damageType }],
    damageRoll.total,
    new Set([token]),
    item,
    new Set(),
    {flavor: 'Weave the Elder Sign'}
);
