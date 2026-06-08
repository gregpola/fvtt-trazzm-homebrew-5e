/*
	Your damaging cantrips affect even creatures that avoid the brunt of the effect. When you cast a cantrip at a
	creature, and you miss with the attack roll or the target succeeds on a saving throw against the cantrip, the target
	takes half the cantrip’s damage (if any) but suffers no additional effect from the cantrip.
*/
const optionName = "Potent Cantrip";
const version = "14.5.0";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postActiveEffects") {
        // make sure it's an eligible spell
        if (rolledItem.type === "spell" && rolledActivity.type === "attack" && workflow.castData.castLevel === 0) {
            // collect missed targets
            const missedTargets = [];
            for (let t of workflow.targets) {
                if (!workflow.hitTargets.has(t)) {
                    missedTargets.push(t);
                }
            }

            if (missedTargets.length > 0) {
                const damageType = workflow.defaultDamageType;
                const damageTotal = Math.floor(workflow.damageTotal / 2);
                await HomebrewHelpers.applyDamage(missedTargets, damageTotal , damageType);
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
