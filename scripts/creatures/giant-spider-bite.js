const version = "11.0";
const optionName = "Giant Spider Bite";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let target = workflow.failedSaves.first();
        if (target) {
            let damageRoll = await new Roll('2d8').roll();
            await game.dice3d?.showForRoll(damageRoll);
            await new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "poison", [target], damageRoll, {itemCardId: args[0].itemCardId});
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
