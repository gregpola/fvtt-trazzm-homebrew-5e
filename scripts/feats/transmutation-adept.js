/**
 * Magical Augmentation. On your turn when you cast a spell from the Transmutation school using a spell slot, your Speed
 * increases by a number of feet equal to five times the level of spell slot expended. This increase lasts until the end
 * of the turn.
 */
const optionName = "Transmutation Adept";
const version = "14.5.0";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postActiveEffects" && rolledItem.type === "spell" && rolledItem.system.school === "trs") {
        const spellLevel = workflow.castData.castLevel;

        // make sure it was cast using a spell slot???
        if (spellLevel > 0 && rolledActivity.consumption?.spellSlot) {
            await applyMoveBonus(actor, spellLevel * 5);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyMoveBonus(actor, bonus) {
    let effectData = {
        name: `${optionName} - movement bonus`,
        icon: macroItem.img,
        origin: macroItem.uuid,
        type: "base",
        transfer: false,
        statuses: [],
        duration: {
            "value": 0,
            "units": 'turns',
            "expiry": 'turnEnd',
            "expired": false
        },
        changes: [
            {
                'key': 'system.attributes.movement.all',
                'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                'value': `+${bonus}`,
                'priority': 20
            }
        ]
    };

    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effectData] });
}
