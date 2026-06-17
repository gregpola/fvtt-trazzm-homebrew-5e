/*
    Repair (3/Day). The defender, or one Construct or object it can see within 5 feet of itself, regains a number of Hit Points equal to 2d8 plus your Intelligence modifier.

    Force-Empowered Rend. Melee Attack Roll: Bonus equals your spell attack modifier, reach 5 ft. Hit: 1d8 + 2 plus your Intelligence modifier Force damage.

    L15 - Improved Deflection. Whenever your Steel Defender uses its Deflect Attack, the attacker takes Force damage equal to 1d4 plus your Intelligence modifier.
*/
const optionName = "Steel Defender";
const version = "14.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        // get the summon
        const theSteelDefender = actor.summonedCreatures.find(s => s.name === 'Steel Defender')
        if (theSteelDefender) {
            const intMod = actor.system.abilities.int.mod;
            const abilityBonus = actor.system.attributes.spell.mod;

            const repairItem = theSteelDefender.items.getName("Repair");
            if (repairItem) {
                let healingActivity = repairItem.system.activities.getName("Heal");
                await healingActivity.update({
                    "healing.bonus" : intMod
                });
            }

            const rendItem = theSteelDefender.items.getName("Force-Empowered Rend");
            if (rendItem) {
                await rendItem.update({
                    "system.damage.base.bonus" : intMod
                });
            }

            const attackBonusEffect = HomebrewEffects.findEffect(theSteelDefender, "Attack Bonus");
            if (attackBonusEffect) {
                const bonusChange = attackBonusEffect.changes.find(change => change.key === 'system.bonuses.mwak.attack');
                if (bonusChange) {
                    await attackBonusEffect.update({
                        changes: [{
                            key: 'system.bonuses.mwak.attack',
                            value: `${abilityBonus}`,
                            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                            priority: 20
                        }]});
                }
            }

            // Update for level 15
            const hasImprovedDefender = actor.items.getName("Improved Deflection");
            if (hasImprovedDefender) {
                const deflectAttackItem = theSteelDefender.items.getName("Deflect Attack");
                if (deflectAttackItem) {
                    let distractActivity = deflectAttackItem.system.activities.getName("Distract Target");
                    if (distractActivity) {
                        await distractActivity.update({
                            "midiProperties.triggeredActivityConditionText" : "true"
                        });
                    }
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
