if (!game.FireShieldHookClientSpecificId) {
    game.FireShieldHookClientSpecificTokenUuid = token.document.uuid;
	
	game.FireShieldHookClientSpecificId = Hooks.on("preUpdateActor", async (actor,update,diff,userId) => {
			if (!diff?.damageItem?.tokenUuid || diff.damageItem.tokenUuid !== game.FireShieldHookClientSpecificTokenUuid || !update?.system?.attributes?.hp || diff?.dhp >= 0) return;
			
			let message = game.messages.contents.filter(mes=>mes.data.content.includes("<div class=\"dnd5e chat-card item-card midi-qol-item-card\"")).pop();
			const item = await fromUuid(message.flags['midi-qol'].itemUuid);
			if (!["mwak","msak"].some(i=>item?.system?.actionType?.includes(i))) return;
			let attackerTokenDoc = item.parent;
			attackerTokenDoc = item.parent.token ? item.parent.token : item.parent.getActiveTokens()[0].document;
			let damageType;
			let sourceActor = await fromUuid(game.FireShieldHookClientSpecificTokenUuid);
			sourceActor = sourceActor.actor ? sourceActor.actor : sourceActor;
			if (sourceActor.effects.find(eff=>eff.getFlag('core','statusId').includes("Cold Resistance"))) damageType = "cold";
			if (sourceActor.effects.find(eff=>eff.getFlag('core','statusId').includes("Fire Resistance"))) damageType = "fire";
			const damageAmount = "2d8";
			const damageRoll = await new Roll(`${damageAmount}[${damageType}]`).evaluate();
			const rollmsg = await damageRoll.toMessage({flavor: `Fire shield reactive ${damageType} damage`});
			game.dice3d?.waitFor3DAnimationByMessageID(rollmsg.id);
			await MidiQOL.applyTokenDamage( [{type: `${damageType}`, damage: damageRoll.total}], damageRoll.total, new Set([attackerTokenDoc]), item, new Set(), {} );
	});
}