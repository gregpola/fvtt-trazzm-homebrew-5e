/*
	You touch a creature and can end either one disease or one condition afflicting it. The condition can be Blinded, Deafened, Paralyzed, or Poisoned.
*/
const version = "10.0.0";
const optionName = "Lesser Restoration";
const condition_list = ["Blinded", "Deafened", "Paralyzed", "Diseased", "Poisoned"];

try {
	if (args[0].macroPass === "postActiveEffects") {
		const lastArg = args[args.length - 1];
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		const actorToken = canvas.tokens.get(lastArg.tokenId);
		const targetToken = game.canvas.tokens.get(lastArg.targets[0].id);
		
		const effect = targetToken.actor.effects.filter(i => condition_list.includes(i.label));
		const selectOptions = effect.reduce((list, activeE) => {
			let condition = activeE.label;
			list.push(`<option value="${condition}">${condition}</option>`);
			return list;
		}, []);
		
		if (selectOptions.length === 0) return ui.notifications.error(`Nothing happens.. There's nothing to Cure on ${targetToken.actor.name}.`);
		let removedCondition = effect[0].label;
		
		if (selectOptions.length > 1) {
			let content = `
				<div class="form-group">
					<label><p>Which condition do you want to cure?</p></label>
					<p>
						<select name="element">${selectOptions.join('')}</select>
					</p>
				</div>`;
				
			let dialog = new Promise((resolve, reject) => {
				new Dialog({
					title: `${optionName}`,
					content,
					buttons:
					{
						pick: {
							label: `Remove it!`,
							callback: async (html) => {
								let cond = html.find('[name=element]')[0].value;
								resolve(cond);
							}
						}
					}
				}).render(true);
			});

			removedCondition = await dialog;
		}

		let chosen = targetToken.actor.effects.find(i => i.label === removedCondition);
		await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: targetToken.actor.uuid, effects: [chosen.id] });

		let chatContent = `<div class="midi-qol-nobox"><div class="midi-qol-flex-container"><div>Cures ${removedCondition}:</div><div class="midi-qol-target-npc midi-qol-target-name" id="${targetToken.id}"> ${targetToken.actor.name}</div><div><img src="${targetToken.document.texture.src}" width="30" height="30" style="border:0px"></img></div></div></div>`;

		ChatMessage.create({
			content: chatContent,
			speaker: ChatMessage.getSpeaker({ actor: actor })});
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
