/*
	A stream of acid emanates from you in a line 30 feet long and 5 feet wide in a direction you choose. Each creature in the line must succeed on a Dexterity saving throw or be covered in acid for the spell’s duration or until a creature uses its action to scrape or wash the acid off itself or another creature. A creature covered in the acid takes 2d4 acid damage at start of each of its turns.

	At Higher Levels. When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 2d4 for each slot level above 1st.
*/
const version = "10.0.0";
const optionName = "Tasha's Caustic Brew";
const damageType = "acid";

try {
	const lastArg = args[args.length - 1];
	const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);

	if (args[0].tag === "OnUse") {
		if (lastArg.failedSaves.length > 0)
			return {};
		
		const conc = actor.effects.find(i => i.label === "Concentrating");
		await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [conc.id] });
		
	} else if (args[0] === "each") {
		let tokenD = canvas.tokens.get(args[1]);
		let damageDice = `${Number(args[2]) * 2}d4[${damageType}]`;
		let itemD = lastArg.efData.flags.dae.itemData;
		itemD.system.components.concentration = false;

		let target = canvas.tokens.get(lastArg.tokenId);
		const damageRoll = await new Roll(damageDice).evaluate({ async: true });
		const damageWorkflow = await new MidiQOL.DamageOnlyWorkflow(actor, target, damageRoll.total, damageType, [target], damageRoll, { flavor: `(${CONFIG.DND5E.damageTypes[damageType]})`, itemData: itemD, itemCardId: "new" });
		await new Dialog({
			title: itemD.name,
			content: "<p>Spend an <b>Action</b> to remove the Acid?</p>",
			buttons: {
				yes: {
					label: "Yes", callback: async () => {
						await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [lastArg.effectId] });
						const the_message = `<div class="midi-qol-nobox midi-qol-bigger-text"><b>Condition : Removed</b></div><hr>`;
						const chatMessage = await game.messages.get(damageWorkflow.itemCard.id);
						let content = await duplicate(chatMessage.content);
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
