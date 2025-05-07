/*
    The target makes a Wisdom saving throw against your spell save DC. On a failed save, the next time the target makes
    an attack roll against a creature other than you before the start of your next turn, the target takes Necrotic
    damage equal to your Charisma modifier.
*/
const optionName = "Harrowing Blade";
const version = "12.4.0";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postAttackRoll") {
        const targetToken = workflow.targets.first();
        const sourceActor = macroItem.parent;

        if (targetToken.actor !== sourceActor) {
            const sourceToken = sourceActor?.token ?? sourceActor?.getActiveTokens()[0];
            let charismaMod = Math.max(1, sourceActor.system.abilities.cha.mod);
            const damageRoll = await new CONFIG.Dice.DamageRoll(`${charismaMod}`, {}, {type: 'necrotic'}).evaluate();
            await new MidiQOL.DamageOnlyWorkflow(sourceActor, sourceToken, null, null, [token], damageRoll, {flavor: optionName, itemCardId: "new", itemData: macroItem.toObject()});

            // expire effect
            const originStart = `Actor.${sourceActor.id}.`;
            let harrowingEffect = actor.getRollData().effects.find(e => e.name === optionName && e.origin.startsWith(originStart));
            if (harrowingEffect) {
                await MidiQOL.socket().executeAsGM("removeEffects", {
                    actorUuid: actor.uuid,
                    effects: [harrowingEffect.id]
                });
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
