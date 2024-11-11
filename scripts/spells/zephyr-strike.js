/*
    You move like the wind. Until the spell ends, your movement doesn’t provoke opportunity attacks.

    Once before the spell ends, you can give yourself advantage on one weapon attack roll on your turn. That attack
    deals an extra 1d8 force damage on a hit. Whether you hit or miss, your walking speed increases by 30 feet until the
    end of that turn.
 */
const version = "12.3.0";
const optionName = "Zephyr Strike";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "zephyr-strike-used";
let used = actor.getFlag(_flagGroup, flagName);

try {
    if (args[0].macroPass === "postActiveEffects") {
        await actor.unsetFlag(_flagGroup, flagName);
    }
    else if (args[0].macroPass === "preAttackRoll") {
        if (workflow.item.type === "weapon" && !isActive() && !used) {
            // ask for damage bonus use
            const useFeature = await foundry.applications.api.DialogV2.confirm({
                window: {
                    title: `${optionName}`,
                },
                content: `<p>Do you want to use Zephyr Strike Advantage and Extra Dice?</p>`,
                rejectClose: false,
                modal: true
            });

            if (useFeature) {
                let allEffects = Array.from(actor.allApplicableEffects());
                let effect = allEffects.find(e => e.name === 'Zephyr Strike Movement');
                if (effect) {
                    await effect.update({"disabled" : false});
                }

                await actor.setFlag(_flagGroup, flagName, actor.uuid);
                workflow.advantage = true;
            }
		}
	}
	else if (args[0].macroPass === "DamageBonus") {
        if (isActive()) {
            // Use same roll options as the one from the damageRoll
            const dmgOptions = workflow.damageRoll?.options ? duplicate(workflow.damageRoll.options) : {};
            dmgOptions.critical = workflow.isCritical;
            delete dmgOptions.configured;
            delete dmgOptions.flavor;
            delete dmgOptions.criticalBonusDice;
            // Construct a DamageRoll to compute critical damage using the appropriate defined method and use the resulting formula
            const damageBonusResult = new CONFIG.Dice.DamageRoll("1d8[force]", workflow.rollData, dmgOptions);
            return {damageRoll: damageBonusResult.formula, flavor: "Zephyr Strike Damage"};
        }
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

function isActive() {
    const effect = HomebrewHelpers.findEffect(actor, "Zephyr Strike Advantage");
    if (effect) {
        return true;
    }

    return false;
}
