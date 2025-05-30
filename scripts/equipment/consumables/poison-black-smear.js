/*
    A creature subjected to this poison must succeed on a DC 11 Constitution saving throw. On a failed save the creature
    takes 4 (1d8) poison damage and is poisoned for 24 hours. While poisoned in this way, the creature smells of black
    smear. On a successful save, the creature takes half damage and isn't poisoned.
*/
const version = "12.4.0";
const optionName = "Black Smear Poison";
const coatedName = "Black Smear Poisoned";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _usesFlag = "coating-uses";
const maxUses = 3; // for ammunition
const saveDC = 11;

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
                const hasResilience = HomebrewHelpers.hasResilience(targetToken.actor, "poison");
                let saveRoll = await targetToken.actor.rollAbilitySave("con", {
                    flavor: `${CONFIG.DND5E.abilities["con"].label} DC${saveDC} ${optionName}`,
                    advantage : hasResilience
                });

                const saved = saveRoll.total >= saveDC;
                let newDamageRolls = workflow.damageRolls;
                let poisonRoll = undefined;

                if (saved) {
                    poisonRoll = await new CONFIG.Dice.DamageRoll('1d8 / 2', workflow.item.getRollData(), {type: 'poison'}).evaluate();
                }
                else {
                    poisonRoll = await new CONFIG.Dice.DamageRoll('1d8', workflow.item.getRollData(), {type: 'poison'}).evaluate();
                    await HomebrewEffects.applyPoisonedEffect2024(targetToken.actor, macroItem, ['longRest'], 86400);
                }
                newDamageRolls.push(poisonRoll);
                await workflow.setDamageRolls(newDamageRolls);
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
