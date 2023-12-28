/*
    If damage reduces the undead to 0 hit points, it must make a Constitution saving throw with a DC of 5 + the damage
    taken, unless the damage is radiant or from a critical hit. On a success, the undead drops to 1 hit point instead.
*/
const version = "11.0";
const optionName = "Undead Fortitude";

try {
    if (args[0].macroPass === "isDamaged") {
        // skip for critical
        if (workflow.damageItem.critical) {
            console.log(`${optionName}: ${version} - skipping for critical`);
            return;
        }

        if (workflow.damageDetail) {
            // look for radiant damage
            for (let dd of workflow.damageItem.damageDetail) {
                if (dd.type && dd.type.toLowerCase() === "radiant") {
                    console.log(`${optionName}: ${version} - skipping for radiant damage`);
                    return;
                }
            }

            // check for reduction to 0 hp
            if (workflow.damageItem.newHP === 0) {
                // roll the con save
                const saveDC = 5 + workflow.damageItem.appliedDamage;
                const saveResult = (await actor.rollAbilitySave('con', {flavor: `${optionName} - DC ${saveDC}`, rollMode: 'roll'})).total;

                if (saveResult >= saveDC) {
                    let currentHP = actor.system.attributes.hp.value;
                    const newDamage = currentHP - 1;
                    workflow.damageItem.appliedDamage = newDamage;
                    workflow.damageItem.hpDamage = newDamage;
                    workflow.damageItem.newHP = 1;

                    ChatMessage.create({
                        content: `${actor.name} shrugs off the death blow to keep fighting!`,
                        speaker: ChatMessage.getSpeaker({ actor: actor })});

                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
