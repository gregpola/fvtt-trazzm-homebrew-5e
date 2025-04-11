/*
    As a Bonus Action, you can apply a poison dose to a weapon or piece of ammunition. Once applied, the poison retains
    its potency for 1 minute or until you deal damage with the poisoned item, whichever is shorter. When a creature takes
    damage from the poisoned item, that creature must succeed on a Constitution saving throw (DC 8 plus the modifier of
    the ability increased by this feat and your Proficiency Bonus) or take 2d8 Poison damage and have the Poisoned
    condition until the end of your next turn.
 */
const version = "12.4.0";
const optionName = "Poisoner Poison";
const coatedName = "Poisoner poisoned";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _usesFlag = "coating-uses";
const maxUses = 3; // for ammunition

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postDamageRoll") {
        let coatedEffect = rolledItem.effects.find(e => e.name === coatedName && e.type === 'enchantment');
        if (coatedEffect) {
            let expireCoating = true;

            // check for ammo
            if (rolledItem.system.properties.has('amm')) {
                let flag = coatedEffect.getFlag(_flagGroup, _usesFlag);
                if (flag) {
                    if (flag < (maxUses - 1)) {
                        await coatedEffect.setFlag(_flagGroup, _usesFlag, flag + 1);
                        expireCoating = false;
                    }
                }
                else {
                    await coatedEffect.setFlag(_flagGroup, _usesFlag, 1);
                    expireCoating = false;
                }
            }

            if (expireCoating) {
                await rolledItem.deleteEmbeddedDocuments("ActiveEffect", [coatedEffect.id]);
            }

            // request the saving throw
            let targetToken = workflow.hitTargets.first();
            if (targetToken) {
                const saveDC = 8 + actor.system.abilities.dex.mod + actor.system.attributes.prof;
                const hasResilience = HomebrewHelpers.hasResilience(targetToken.actor, "poison");
                let saveRoll = await targetToken.actor.rollAbilitySave("con", {
                    flavor: `${CONFIG.DND5E.abilities["con"].label} DC${saveDC} ${optionName}`,
                    advantage : hasResilience
                });

                if (saveRoll.total < saveDC) {
                    await HomebrewEffects.applyPoisonedEffect2024(targetToken.actor, macroItem, ['turnEndSource']);

                    let newDamageRolls = workflow.damageRolls;
                    let poisonRoll = await new CONFIG.Dice.DamageRoll('2d8', workflow.item.getRollData(), {type: 'poison'}).evaluate();
                    newDamageRolls.push(poisonRoll);
                    await workflow.setDamageRolls(newDamageRolls);
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
