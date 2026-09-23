/**
 * A tendril of inky darkness reaches out from you to drain life from a creature you can see within range.
 *
 * The target makes a Dexterity saving throw. On a failed save, the target takes 6d8 Necrotic damage. On each of your
 * subsequent turns, you can take a Bonus Action to deal 2d8 Necrotic damage to the target automatically. The spell ends
 * if the target is ever outside the spell’s range or it has Total Cover from you.
 *
 * On a successful save, the target takes half the initial damage only, and the spell ends.
 *
 * Whenever this spell deals damage to a target, you regain Hit Points equal to half the amount of Necrotic damage dealt.
 *
 * Using a Higher-Level Spell Slot. The initial damage increases by 1d8 for each spell slot level above 5.
 */
const optionName = "Enervation";
const version = "14.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const rolledDamage = workflow.damageItem.totalDamage;
        if (rolledDamage) {
            const healAmount = Math.round(Number(rolledDamage) / 2);
            const damageRoll = await new CONFIG.Dice.DamageRoll(`${healAmount}`, {}, {type: "healing", properties: ["mgc"]}).evaluate();
            await new MidiQOL.DamageOnlyWorkflow(actor, token, null, null, [token], damageRoll, {
                flavor: optionName,
                itemCardId: "new",
                itemData: macroItem.toObject()
            });
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
