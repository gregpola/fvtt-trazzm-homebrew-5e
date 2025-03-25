const version = "12.3.0";
const optionName = "Hex - Curse New Target";
const targetOptionName = "Hex Marked";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const targetFlagName = "hex-target";

try {
    if (args[0].macroPass === "preItemRoll") {
        let result = false;
        let oldTargetName;

        // make sure the current target is dead
        const targetFlag = actor.getFlag(_flagGroup, targetFlagName);
        if (targetFlag) {
            let target = await fromUuid(targetFlag.targetActorUuid);
            if (target) {
                if (target.system.attributes.hp.value > 0) {
                    oldTargetName = target.name;
                }
                else {
                    let oldEffect = target.effects.find(i => i.name === targetOptionName && i.origin === targetFlag.origin);
                    if (oldEffect) {
                        // TODO pull the remaining duration
                        await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: target.uuid, effects: [oldEffect.id] });
                    }
                    result = true;
                }
            }
        }

        if (!result) {
            ChatMessage.create({
                content: `Unable to re-curse with Hex - ${oldTargetName} is still alive`,
                speaker: ChatMessage.getSpeaker({ actor: actor })});
        }

        return result;
    }
    else if (args[0].macroPass === "postActiveEffects") {
        let targetToken = workflow.targets?.first();
        if (targetToken) {
            const targetFlag = actor.getFlag(_flagGroup, targetFlagName);
            const hexItem = await fromUuid(targetFlag.origin);

            // Ask which ability they want to hex
            new Dialog({
                title: 'Choose which ability the target will have disadvantage on ability checks with:',
                content: `<form class="flexcol">
                    <div class="form-group">
                      <select id="stat">
                        <option value="str">Strength</option>
                        <option value="dex">Dexterity</option>
                        <option value="con">Constitution</option>
                        <option value="int">Intelligence</option>
                        <option value="wis">Wisdom</option>
                        <option value="cha">Charisma</option>
                      </select>
                    </div>
                  </form>`,
                buttons: {
                    yes: {
                        icon: '<i class="fas fa-bolt"></i>',
                        label: 'Select',
                        callback: async (html) => {
                            let stat = html.find('#stat').val();
                            actor.setFlag(_flagGroup, targetFlagName, { targetActorUuid: targetToken.actor.uuid, origin: targetFlag.origin, duration: targetFlag.duration});

                            // apply effect to the target
                            let targetEffectData = {
                                'name': targetOptionName,
                                'icon': hexItem.img,
                                'origin': targetFlag.origin,
                                'duration': {
                                    'seconds': targetFlag.duration
                                },
                                'changes': [
                                    { 'key': `flags.midi-qol.disadvantage.ability.check.${stat}`,
                                        'mode': 5,
                                        'value': true,
                                        'priority': 10}
                                ],
                                'flags': { 'dae': { 'specialDuration': ["zeroHP"] } }
                            };
                            await MidiQOL.socket().executeAsGM('createEffects', {'actorUuid': targetToken.actor.uuid, 'effects': [targetEffectData]});
                        },
                    },
                }
            }).render(true);
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
