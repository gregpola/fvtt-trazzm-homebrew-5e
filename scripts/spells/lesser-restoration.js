/*
	You touch a creature and can end either one disease or one condition afflicting it. The condition can be Blinded, Deafened, Paralyzed, or Poisoned.
*/
const version = "13.5.0";
const optionName = "Lesser Restoration";
const condition_list = new Set(["blinded", "deafened", "paralyzed", "diseased", "poisoned"]);

try {
	if (args[0].macroPass === "postActiveEffects") {
		for (let targetToken of workflow.targets) {
			// look for statuses that can be cured
			console.log(targetToken.actor);

			let removedCondition;
			const eligibleStatuses = condition_list.intersection(targetToken.actor.statuses);

			if (eligibleStatuses.size === 1) {
				removedCondition = eligibleStatuses.first();
			}
			else if (eligibleStatuses.size > 1) {
				let target_list = [...eligibleStatuses].reduce((list, target) => list += `<option value="${target}">${target}</option>`, ``);

				removedCondition = await foundry.applications.api.DialogV2.prompt({
					content: `<p>Which condition do you want to cure?</p><form><div class="form-group"><select id="condition">${target_list}</select></div></form>`,
					rejectClose: false,
					ok: {
						callback: (event, button, dialog) => {
							return button.form.elements.condition.value;
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
				// remove the effects that contribute the removed condition
				let actorEffects = Array.from(targetToken.actor.allApplicableEffects());
				let removedEffects = actorEffects.filter(s => s.statuses.has(removedCondition));
				if (removedEffects) {
					const effectIdList = removedEffects.map(obj => obj.id);
					await MidiQOL.socket().executeAsGM("removeEffects", {actorUuid: targetToken.actor.uuid, effects: effectIdList});
				}


				let chatContent = `<div class="midi-qol-nobox"><div class="midi-qol-flex-container"><div>Cures ${removedCondition} from: </div><div class="midi-qol-target-npc midi-qol-target-name" id="${targetToken.id}"> ${targetToken.actor.name}</div><div><img src="${targetToken.document.texture.src}" width="30" height="30" style="border:0px" /></div></div></div>`;
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
