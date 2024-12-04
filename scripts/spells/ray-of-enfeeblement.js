/*
	A black beam of enervating energy springs from your finger toward a creature within range. Make a ranged spell attack
	against the target. On a hit, the target deals only half damage with weapon attacks that use Strength until the spell ends.

	At the end of each of the target's turns, it can make a Constitution saving throw against the spell. On a success, the spell ends.

	ItemMacro.Compendium.fvtt-trazzm-homebrew-5e.homebrew-spells.HlLxlYEoVfJjREYW,postDamageRoll
	overtime:
		turn=end, saveAbility=con, saveDC=@attributes.spelldc, label=Ray of Enfeeblement
*/
const version = "12.3.0";
const optionName = "Ray of Enfeeblement";

try {
    if (args[0].macroPass === "postDamageRoll") {
        if (!["mwak", "rwak"].includes(workflow.item.system.actionType)) return;
        if (item.system.properties.has('fin')) {
            let str = actor.system.abilities.str.value;
            let dex = actor.system.abilities.dex.value;
            if (str < dex) return;
        }

        workflow.damageRolls = await Promise.all(workflow.damageRolls.map(async damageRoll => {
            return await new CONFIG.Dice.DamageRoll('floor((' + damageRoll.formula + ') / 2)', workflow.actor.getRollData(), damageRoll.options);
        }));
        await workflow.setDamageRolls(workflow.damageRolls);
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
