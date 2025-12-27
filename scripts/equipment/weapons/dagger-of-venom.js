/*
    You can take a Bonus Action to magically coat the blade with poison. The poison remains for 1 minute or until an
    attack using this weapon hits a creature. That creature must succeed on a DC 15 Constitution saving throw or take
    2d10 Poison damage and have the Poisoned condition for 1 minute. The weapon can’t be used this way again until the
    next dawn.
*/
const optionName = "Dagger of Venom";
const version = "13.5.0";
const coatedName = "Coated with Poison";
const saveItemId = "poison-save";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postDamageRoll") {
        let coatedEffect = rolledItem.effects.find(e => e.name === coatedName && e.type === 'enchantment' && e.isAppliedEnchantment);
        if (coatedEffect) {
            await rolledItem.deleteEmbeddedDocuments("ActiveEffect", [coatedEffect.id]);

            // trigger poison save
            let targetToken = workflow.hitTargets.first();
            if (targetToken) {
                let activity = await rolledItem.system.activities.find(a => a.identifier === saveItemId);
                if (activity) {
                    const options = {
                        midiOptions: {
                            targetUuids: [targetToken.actor.uuid],
                            noOnUseMacro: false,
                            configureDialog: false,
                            showFullCard: false,
                            ignoreUserTargets: true,
                            checkGMStatus: false,
                            autoRollAttack: true,
                            autoRollDamage: "always",
                            fastForwardAttack: true,
                            fastForwardDamage: true,
                            workflowData: true
                        }
                    };

                    await MidiQOL.completeActivityUse(activity, options, {}, {});
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
