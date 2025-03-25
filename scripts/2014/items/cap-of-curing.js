const version = "12.3.0";
const optionName = "Cap of Curing";

try {
    if (args[0].macroPass === "preApplyDynamicEffects") {
        let targetToken = workflow.targets.first();
        if (targetToken && item.name === "Bardic Inspiration") {
            const inspirationDie = actor.system.scale.bard["inspiration"];
            const damageRoll = await new Roll(`${inspirationDie}`).evaluate();
            await new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "healing", [targetToken], damageRoll, {flavor: optionName, itemCardId: args[0].itemCardId});
        }
    }
}
catch (err) {
    console.error(`${optionName} - ${version}`, err);
}
