/*
	You can increase the power of your spells. When you cast a Wizard spell with a spell slot of levels 1–5 that deals
	damage, you can deal maximum damage with that spell on the turn you cast it.

	The first time you do so, you suffer no adverse effect. If you use this feature again before you finish a Long Rest,
	you take 2d12 Necrotic damage for each level of the spell slot immediately after you cast it. This damage ignores
	Resistance and Immunity.

	Each time you use this feature again before finishing a Long Rest, the Necrotic damage per spell level increases by 1d12.
*/
const optionName = "Overchannel";
const version = "14.5.0";
const timeFlag = "overchannel-time";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "preDamageRollComplete") {
        if (rolledItem.type === "spell" && rolledItem.system.sourceClass === "wizard"
            && workflow.castData.castLevel > 0 && workflow.castData.castLevel < 6) {

            // maximize the damage
            await Promise.all(workflow.damageRolls.map(async (damageRoll, i, arr) => {
                arr[i] = await damageRoll.reroll({maximize: true});
            }));
            await workflow.setDamageRolls(workflow.damageRolls);

            // check the use count to see if we should damage the actor
            // make sure this is only once per turn -- magic missile
            if (HomebrewHelpers.isAvailableThisTurn(actor, timeFlag)) {
                const spentValue = macroItem.system.uses.spent;
                if (spentValue > 1) {
                    const targetUuids = [token.document.uuid];
                    const activity = macroItem.system.activities.find(a => a.identifier === 'following-uses-damage');
                    if (activity) {
                        // update the damage based on the spell level
                        const damageParts = foundry.utils.duplicate(activity.damage.parts);
                        damageParts[0].custom.formula = `${workflow.castData.castLevel}*(2 + ${spentValue} - 1)d12`;

                        await activity.update({
                            "damage.parts": damageParts
                        });

                        // apply the damage
                        await MidiQOL.completeActivityUse(activity, {midiOptions: {targetUuids}});
                    }
                }

                await HomebrewHelpers.setUsedThisTurn(actor, timeFlag);
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
