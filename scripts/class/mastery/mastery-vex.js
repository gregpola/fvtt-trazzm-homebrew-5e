/*
    If you hit a creature with this weapon and deal damage to the creature, you have Advantage on your next attack roll
    against that creature before the end of your next turn.
*/
const version = "12.4.0";
const optionName = "Weapon Mastery: Vex";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "preAttackRoll") {
        const targetToken = workflow.targets.first();
        if (targetToken) {
            // check action eligibility
            if (rolledItem.type === "weapon" && rolledItem.system.mastery === "vex") {
                let markedEffect = targetToken.actor.getRollData().effects.find(eff => eff.name === "Vexed" && eff.origin.startsWith(macroItem.uuid));
                if (markedEffect) {
                    workflow.advantage = true;
                    await MidiQOL.socket().executeAsGM('removeEffects', {
                        'actorUuid': targetToken.actor.uuid,
                        'effects': [markedEffect.id]
                    });
                }
            }
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
