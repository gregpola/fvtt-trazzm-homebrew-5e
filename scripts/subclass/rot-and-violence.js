/*
    Your dedication to wild eldritch beings alters you further. When transformed using Wrath of the Wild, you gain the
    following additional benefits.

    Menacing Aura. When a creature fails its saving throw against your Unnerving Aura, it also can’t regain Hit Points
    or take Reactions until the start of your next turn.

    Strangling Roots. When you hit a creature with an attack roll using a weapon, you can activate the Sap or Slow
    mastery property in addition to a different mastery property you’re using with that weapon.
*/
const optionName = "Rot and Violence";
const version = "14.5.0";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postActiveEffects") {
        if (HomebrewEffects.findEffect(actor, "Wrath of the Wild")) {
            if (rolledItem.type === "weapon") {
                const targetToken = workflow.hitTargets.first();
                if (targetToken && TrazzmHomebrew.weaponMastery.hasMastery(actor, rolledItem)) {
                    // trigger activity
                    const targetUuids = [targetToken.document.uuid];
                    const activity = macroItem.system.activities.find(a => a.identifier === 'apply-sap-or-slow');
                    if (activity) await MidiQOL.completeActivityUse(activity, { midiOptions: { targetUuids } });

                }
            }
            else if (rolledItem.name === "Unnerving Aura") {
                const effect = macroItem.effects.getName('Menacing Aura');
                if (effect) {
                    for (let tt of workflow.failedSaves) {
                        await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: tt.actor.uuid, effects: [effect]});
                    }
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
