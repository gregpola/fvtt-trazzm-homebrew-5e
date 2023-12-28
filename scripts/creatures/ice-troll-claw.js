/*
    Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) slashing damage plus 9 (2d8) cold damage.
    If the target takes any of the cold damage, the target must succeed on a DC 15 Constitution saving throw or have
    disadvantage on its attack rolls until the end of its next turn.
*/
const version = "11.0";
const optionName = "Ice Troll Claw";
const saveDC = 15;

try {
    if (args[0].macroPass === "postActiveEffects") {
        let target = workflow.hitTargets.first();
        if (target) {
            const coldDamage = workflow.damageDetail.find(i => i.type === "cold");
            if (coldDamage && coldDamage.damage > 0) {
                const userID = MidiQOL.playerForActor(target.actor)?.active?.id ?? game.users.activeGM?.id;
                if (!userID) {
                    ui.notifications.error(`${optionName}: ${version} - no userID found`);
                    return;
                }
                const data = {
                    request: 'save',
                    targetUuid: target.document.uuid,
                    ability: 'con',
                    options: {
                        skipDialogue: true,
                        saveDC,
                    },
                };
                const save = await MidiQOL.socket().executeAsUser('rollAbility', userID, data);
                if (save.total < saveDC) {
                    let targetEffectData = {
                        'name': optionName,
                        'icon': workflow.item.img,
                        'origin': workflow.item.uuid,
                        'changes': [
                            {
                                key: 'flags.midi-qol.disadvantage.attack.all',
                                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                                value: 'true',
                                priority: 20
                            }
                        ],
                        'flags': { 'dae': { 'specialDuration': ["turnEnd"] } }
                    };
                    await MidiQOL.socket().executeAsGM('createEffects', {'actorUuid': target.actor.uuid, 'effects': [targetEffectData]});
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
