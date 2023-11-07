/*
    You point at one creature you can see within range, and the sound of a dolorous bell fills the air around it for a
    moment. The target must succeed on a Wisdom saving throw or take 1d8 necrotic damage. If the target is missing any
    of its hit points, it instead takes 1d12 necrotic damage.

    The spell’s damage increases by one die when you reach 5th level (2d8 or 2d12), 11th level (3d8 or 3d12), and 17th level (4d8 or 4d12).
*/
const version = "11.0";
const optionName = "Toll the Dead";

try {
    if (args[0].macroPass === "postDamageRoll") {
        const target = workflow.targets.first();
        const needsD12 = target.actor.system.attributes.hp.value < target.actor.system.attributes.hp.max;

        if (needsD12) {
            let damageFormula = workflow.damageRoll._formula.replace('d8', 'd12');
            let damageRoll = await new Roll(damageFormula).roll({async: true});
            await workflow.setDamageRoll(damageRoll);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
