/*
    You can siphon the animating magic of your Reanimated Companion to bolster yourself. When you or your companion
    takes damage, you can take a Reaction to gain a number of Hit Points equal to your companion’s current Hit Points.
    The companion then immediately drops to 0 Hit Points and dies (triggering its Death Burst trait).
*/
const optionName = "Life Transfer";
const version = "14.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        // verify the target is the actor's companion
        const targetToken = workflow.targets.first();
        const companion = actor.summonedCreatures.find(s => s.name === 'Reanimated Companion');
        const companionToken = MidiQOL.tokenForActor(companion);

        if (companionToken === targetToken) {
            // drain the companion
            const companionHP = companion.system.attributes.hp.value;
            if (companionHP > 0) {
                const damageRoll = await new CONFIG.Dice.DamageRoll(`${companionHP}`, {}, {type: "radiant", properties: ["mgc"]}).evaluate();
                await new MidiQOL.DamageOnlyWorkflow(actor, token, null, null, [companionToken], damageRoll, {
                    flavor: `${optionName}`,
                    itemCardId: "new",
                    itemData: sourceItem.toObject()
                });

                // apply healing to the actor
                const healRoll = await new CONFIG.Dice.DamageRoll(`${companionHP}`, {}, {type: "healing", properties: ["mgc"]}).evaluate();
                await new MidiQOL.DamageOnlyWorkflow(actor, token, null, null, [token], healRoll, {
                    flavor: `${optionName}`,
                    itemCardId: "new",
                    itemData: sourceItem.toObject()
                });
            }
        }
        else {
            ui.notifications.error(`${optionName}: ${version} - your target is not your Reanimated Companion`);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
