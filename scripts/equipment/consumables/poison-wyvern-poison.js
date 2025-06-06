/*
    A creature subjected to Wyvern Poison makes a DC 14 Constitution saving throw, taking 24 (7d6) Poison damage on a
    failed save or half as much damage on a successful one
*/
const version = "12.4.0";
const optionName = "Wyvern Poison";
const coatedName = "Wyvern Poisoned";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _usesFlag = "coating-uses";
const maxUses = 3; // for ammunition
const saveDC = 14;

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
                    poisonRoll = await new CONFIG.Dice.DamageRoll('7d6 / 2', workflow.item.getRollData(), {type: 'poison'}).evaluate();
                }
                else {
                    poisonRoll = await new CONFIG.Dice.DamageRoll('7d6', workflow.item.getRollData(), {type: 'poison'}).evaluate();
                }
                newDamageRolls.push(poisonRoll);
                await workflow.setDamageRolls(newDamageRolls);
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
