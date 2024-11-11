/*
	You touch a creature and can end either one disease or one condition afflicting it. The condition can be Blinded, Deafened, Paralyzed, or Poisoned.
*/
const version = "12.3.1";
const optionName = "Lesser Restoration";
const condition_list = ["Blinded", "Deafened", "Paralyzed", "Diseased", "Poisoned"];

try {
	if (args[0].macroPass === "postActiveEffects") {
		const targetToken = workflow.targets.first();
		if (targetToken) {
			const matchingEffects = HomebrewEffects.filterEffectsByConditions(targetToken.actor, condition_list);

			let removedCondition;
			if (matchingEffects.length === 0) {
				return ui.notifications.error(`Nothing happens.. There's nothing to Cure on ${targetToken.actor.name}.`);
			}
			else if (matchingEffects.length === 1) {
				removedCondition = matchingEffects[0];
			}
			else if (matchingEffects.length > 1) {
				let target_list = await matchingEffects.reduce((list, target) => list += `<option value="${target.id}">${target.name}</option>`, ``);

				removedCondition = await foundry.applications.api.DialogV2.prompt({
					content: `<p>Which condition do you want to cure?</p><form><div class="form-group"><select id="condition">${target_list}</select></div></form>`,
					rejectClose: false,
					ok: {
						callback: (event, button, dialog) => {
							const effectId = button.form.elements.condition.value;
							return targetToken.actor.getRollData().effects.find(e => e.id === effectId);
						}
					},
					window: {
						title: `${optionName}`
					},
					position: {
						width: 400
					}
				});

			}

			if (removedCondition) {
				await MidiQOL.socket().executeAsGM("removeEffects", {
					actorUuid: targetToken.actor.uuid,
					effects: [removedCondition.id]
				});

				let chatContent = `<div class="midi-qol-nobox"><div class="midi-qol-flex-container"><div>Cures ${removedCondition}:</div><div class="midi-qol-target-npc midi-qol-target-name" id="${targetToken.id}"> ${targetToken.actor.name}</div><div><img src="${targetToken.document.texture.src}" width="30" height="30" style="border:0px"></img></div></div></div>`;
				ChatMessage.create({
					content: chatContent,
					speaker: ChatMessage.getSpeaker({actor: actor})
				});
			}
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
