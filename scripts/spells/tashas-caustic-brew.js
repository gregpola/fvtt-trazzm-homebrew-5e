/*
	A stream of acid emanates from you in a line 30 feet long and 5 feet wide in a direction you choose. Each creature
	in the line must succeed on a Dexterity saving throw or be covered in acid for the spell’s duration or until a
	creature uses its action to scrape or wash the acid off itself or another creature. A creature covered in the acid
	takes 2d4 acid damage at start of each of its turns.

	At Higher Levels. When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 2d4
	for each slot level above 1st.
*/
const version = "12.3.1";
const optionName = "Tasha's Caustic Brew";
const damageType = "acid";

try {
	if (args[0].tag === "OnUse") {
		if (workflow.failedSaves.size > 0)
			return;
		
		const conc = actor.effects.find(i => i.name === "Concentrating");
		await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [conc.id] });

	} else if (args[0] === "on") {

	} else if (args[0] === "off") {

	} else if (args[0] === "each") {
		let damageDice = `${Number(args[2]) * 2}d4[${damageType}]`;
		const damageRoll = await new Roll(damageDice).evaluateSync();
		const damageWorkflow = await new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, damageType, [token], damageRoll, { flavor: `(${CONFIG.DND5E.damageTypes[damageType]})`, itemData: item, itemCardId: "new" });
		await new Dialog({
			title: item.name,
			content: "<p>Spend an <b>Action</b> to remove the Acid?</p>",
			buttons: {
				yes: {
					label: "Yes", callback: async () => {
						await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [lastArgValue.effectId] });
						const the_message = `<div class="midi-qol-nobox midi-qol-bigger-text"><b>Condition : Removed</b></div><hr>`;
						const chatMessage = await game.messages.get(damageWorkflow.itemCard.id);
						let content = await foundry.utils.duplicate(chatMessage.content);
						let searchString = /<div class="midi-qol-attack-roll">[\s\S]*<div class="end-midi-qol-attack-roll">/g;
						let replaceString = `<div class="midi-qol-attack-roll"><div class="end-midi-qol-attack-roll">${the_message}`;
						content = await content.replace(searchString, replaceString);
						await chatMessage.update({ content: content });
						await ui.chat.scrollBottom();
					}
				},
				no: { label: "No", callback: () => false }
			},
			default: "Yes",
		}).render(true);
	}

} catch (err) {
    console.error(`${optionName}:  ${version}`, err);
}
