/*
    At the start of your first turn of each combat, your walking speed increases by 10 feet, which lasts until the end
    of that turn. If you take the Attack action on that turn, you can make one additional weapon attack as part of that
    action. If that attack hits, the target takes an extra 1d8 damage of the weapon’s damage type.
*/
const version = "11.0";
const optionName = "Dread Ambusher";

try {
    let newEffects = [];
    const featureOrigin = actor.uuid; // ????

    // Movement bonus effect
    const movementBonusEffect = {
        label: "Dread Ambusher - Movement Bonus",
        icon: "icons/skills/movement/feet-winged-boots-brown.webp",
        origin: featureOrigin,
        changes: [
            {
                key: 'system.attributes.movement.walk',
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: 10,
                priority: 20
            }
        ],
        flags: {
            dae: {
                selfTarget: false,
                stackable: "none",
                durationExpression: "",
                macroRepeat: "none",
                specialDuration: [
                    "turnEndSource"
                ],
                transfer: false
            }
        },
        disabled: false
    };
    newEffects.push(movementBonusEffect);

    // Damage bonus effect
    const damageBonusEffect = {
        label: "Dread Ambusher - Bonus Damage",
        icon: "icons/magic/nature/stealth-hide-beast-eyes-green.webp",
        origin: featureOrigin,
        changes: [
            {
                key: 'system.bonuses.mwak.damage',
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: '1d8',
                priority: 20
            },
            {
                key: 'system.bonuses.rwak.damage',
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: '1d8',
                priority: 20
            }
        ],
        flags: {
            dae: {
                selfTarget: false,
                stackable: "none",
                durationExpression: "",
                macroRepeat: "none",
                specialDuration: [
                    "1Attack", "turnEndSource"
                ],
                transfer: false
            }
        },
        disabled: false
    };
    newEffects.push(damageBonusEffect);

    await MidiQOL.socket().executeAsGM("createEffects",
        {actorUuid: actor.uuid, effects: [newEffects]});

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
