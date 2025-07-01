/*
    Your patron grants you the power to curse and hinder your foes. As a Bonus Action, choose one creature you can see
    within 30 feet of yourself. The target is cursed for 1 minute, during which you gain the benefits below. The curse
    ends early if you use this feature again, if you dismiss it (no action required), or die.

    You can use this feature a number of times equal to your Charisma modifier (minimum of once), and you regain all
    expended uses when you finish a Long Rest. When you cast a spell using a spell slot that curses a target, you can
    use your Hexblade’s Curse as a part of casting that spell instead of taking a Bonus Action. When you do so, the
    target of the spell is the target of your Hexblade’s Curse, and your Hexblade’s Curse’s duration is either 1 minute
    or the spell’s duration, whichever is longer.

    Hungering Hex. When the target cursed by your Hexblade’s Curse drops to 0 Hit Points, you regain Hit Points equal to
    1d8 plus your Charisma modifier.

    Accursed Shield. While you aren’t wearing armor or wielding a Shield, you gain a +2 bonus to AC while you are within
    10 feet of the target cursed by your Hexblade’s Curse.
*/
const optionName = "Hexblade’s Curse";
const version = "12.4.0";

try {
    if (args[0].tag === "TargetOnUse" && args[0].macroPass === "isDamaged") {
        if (workflow.damageItem.newHP < 1) {
            const sourceActor = macroItem.parent;

            if (sourceActor) {
                const sourceToken = await MidiQOL.tokenForActor(sourceActor);
                const damageRoll = await new CONFIG.Dice.DamageRoll(`1d8 + ${sourceActor.system.abilities.cha.mod}`, {}, {type: "healing", properties: ["mgc"]}).evaluate();
                await new MidiQOL.DamageOnlyWorkflow(sourceActor, sourceToken, null, null, [sourceToken], damageRoll, {
                    flavor: optionName,
                    itemCardId: "new",
                    itemData: macroItem.toObject()
                });
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
