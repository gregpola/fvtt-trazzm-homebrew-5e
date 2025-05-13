/*
    If you hit a creature with this weapon, you can force the creature to make a Constitution saving throw (DC 8 plus
    the ability modifier used to make the attack roll and your Proficiency Bonus). On a failed save, the creature has
    the Prone condition.
*/
const optionName = "Weapon Mastery: Topple";
const version = "12.4.0";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postAttackRoll") {
        let targetToken = workflow.hitTargets.first();
        if (targetToken && item.type === 'weapon' && item.system.mastery === 'topple' && HomebrewHelpers.hasMastery(actor, item)) {
            const proceed = await foundry.applications.api.DialogV2.confirm({
                window: {
                    title: `${optionName}`,
                },
                content: `Do you want to attempt to knock ${targetToken.name} prone?`,
                rejectClose: false,
                modal: true
            });

            if (proceed) {
                let abilityMod = actor.system.abilities[item.system.ability].mod;
                const saveDC = 8 + abilityMod + actor.system.attributes.prof;

                const saveFlavor = `${CONFIG.DND5E.abilities["con"].label} DC${saveDC} ${optionName}`;
                let saveRoll = await targetToken.actor.rollAbilitySave("con", {flavor: saveFlavor});
                if (saveRoll.total < saveDC) {
                    await targetToken.actor.toggleStatusEffect('prone', {active: true});
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
