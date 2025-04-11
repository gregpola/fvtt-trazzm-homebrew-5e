/*
    As a Bonus Action, you can use a vial of Basic Poison to coat one weapon or up to three pieces of ammunition. A
    creature that takes Piercing or Slashing damage from the poisoned weapon or ammunition takes an extra 1d4 Poison
    damage. Once applied, the poison retains potency for 1 minute or until its damage is dealt, whichever comes first.
*/
const version = "12.4.0";
const optionName = "Poison, Basic";
const coatedName = "Basic Poisoned";
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
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
