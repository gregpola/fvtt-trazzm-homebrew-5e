const version = "10.1";
const optionName = "Hex - Curse New Target";
const targetOptionName = "Hex Marked";
const targetFlagName = "hex-target";

try {
    if (args[0].macroPass === "preItemRoll") {
        let result = true;
        let oldEffect;
        let oldTargetName;

        // make sure the current target is dead
        const targetFlag = actor.getFlag("world", targetFlagName);
        if (targetFlag) {
            let targetToken = await fromUuid(targetFlag.targetId);

            if (targetToken) {
                if (targetToken.actor.system.attributes.hp.value > 0) {
                    result = false;
                    oldTargetName = targetToken.actor.name;
                }
                else {
                    oldEffect = targetToken.actor.effects.find(i => i.label === targetOptionName && i.origin === targetFlag.origin);
                    if (oldEffect) {
                        await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: targetToken.actor.uuid, effects: [oldEffect.id] });
                    }
                }
            }
        }

        let targetActor = workflow?.targets?.first()?.actor;
        if (targetActor && result) {

            // Ask which ability they want to hex
            new Dialog({
                title: 'Choose which ability the target will have disadvantage on ability checks with:',
                content: `
			  <form class="flexcol">
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
			  </form>
			`,
                buttons: {
                    yes: {
                        icon: '<i class="fas fa-bolt"></i>',
                        label: 'Select',
                        callback: async (html) => {
                            let stat = html.find('#stat').val();
                            actor.setFlag("world", targetFlagName, { targetId: targetActor.uuid, origin: targetFlag.origin});

                            // apply effect to the target
                            let targetEffectData = {
                                'label': targetOptionName,
                                'icon': workflow.item.img,
                                'origin': targetFlag.origin,
                                'duration': {
                                    'seconds': 3600
                                },
                                'changes': [
                                    { 'key': `flags.midi-qol.disadvantage.ability.check.${stat}`,
                                        'mode': 5,
                                        'value': true,
                                        'priority': 10}
                                ],
                                'flags': { 'dae': { 'specialDuration': ["zeroHP"] } }
                            };
                            await MidiQOL.socket().executeAsGM('createEffects', {'actorUuid': targetActor.uuid, 'effects': [targetEffectData]});
                        },
                    },
                }
            }).render(true);
        }

        if (!result) {
            ChatMessage.create({
                content: `Unable to re-curse with Hex - ${oldTargetName} is still alive`,
                speaker: ChatMessage.getSpeaker({ actor: actor })});
        }

        return result;
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
