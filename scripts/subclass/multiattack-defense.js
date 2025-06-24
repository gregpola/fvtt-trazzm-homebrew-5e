/*
    When a creature hits you with an attack roll, that creature has Disadvantage on all other attack rolls against you this turn.
*/
const optionName = "Multiattack Defense";
const version = "12.4.0";
const effectName = "Multiattack Defense - Disadvantage";

try {
    if (args[0].tag === "TargetOnUse" && args[0].macroPass === "isHit") {
        if (["mwak", "rwak", "msak", "rsak"].includes(workflow.item.system.actionType)) {
            const attacker = rolledItem.actor;

            let effectData = [{
                name: effectName,
                icon: item.img,
                origin: macroItem.uuid,
                transfer: false,
                disabled: false,
                duration: { turns: 1 },
                flags: {},
                changes: [
                    {
                        key: `flags.midi-qol.disadvantage.attack.all`,
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: 'targetActorUuid == "' + actor.uuid + '"',
                        priority: 20
                    },
                ]
            }];

            await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: attacker.uuid, effects: effectData });
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
