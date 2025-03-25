const version = "12.3.0";
const optionName = "Aid";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const spellLevel = workflow.castData.castLevel;
        const healValue = ((spellLevel - 1) * 5);
        for (let target of workflow.targets) {
            let newHP = target.actor.system.attributes.hp.value;
            let maxHP = target.actor.system.attributes.hp.max;
            newHP = Math.min(maxHP, newHP + healValue);
            await target.actor.update({"system.attributes.hp.value": newHP});
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
