const version = "12.3.0";
const optionName = "Healer's Kit";

try {
    if (args[0].macroPass === "postActiveEffects") {
        const targetToken = workflow.targets.first();
        const healerFeat = actor.items.find(i => i.name === 'Healer');
        if (healerFeat) {
            const damageRoll = await new Roll('1').evaluate();
            await new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "healing", [targetToken], damageRoll,
                {flavor: `${optionName}`, itemCardId: args[0].itemCardId});
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
