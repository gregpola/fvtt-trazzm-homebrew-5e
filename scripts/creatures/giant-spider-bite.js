const version = "11.1";
const optionName = "Giant Spider Bite";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let target = workflow.failedSaves.first();
        let poisonDamage = 0;
        let damageRoll = await new Roll('2d8').roll();
        await game.dice3d?.showForRoll(damageRoll);

        if (target) {
            let r1 = await new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "poison", [target], damageRoll, {itemCardId: args[0].itemCardId});
            console.log(r1);
        }
        else {
            let r2 = await new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "poison", [target], damageRoll, {itemCardId: args[0].itemCardId});
            console.log(r2);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
