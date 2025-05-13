/*
    If your attack roll with this weapon misses a creature, you can deal damage to that creature equal to the ability
    modifier you used to make the attack roll. This damage is the same type dealt by the weapon, and the damage can be
    increased only by increasing the ability modifier.
*/
const optionName = "Weapon Mastery: Graze";
const version = "12.4.0";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postAttackRoll") {
        let targetToken = workflow.hitTargets.first();
        if (!targetToken && item.type === 'weapon' && item.system.mastery === 'graze' && HomebrewHelpers.hasMastery(actor, item)) {
            let damage = actor.system.abilities[item.system.ability].mod;
            if (damage >= 0) {
                const damageType = item.system.damage.base.types.first();
                const damageRoll = await new CONFIG.Dice.DamageRoll(`${damage}`, {}, { type: damageType }).evaluate();
                await new MidiQOL.DamageOnlyWorkflow(actor, token, null, null, [targetToken], damageRoll,
                    {
                        itemCardId: "new",
                        itemData: actor.items.getName(optionName).toObject(),
                        flavor: optionName
                    });
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
