const version = "10.0.23";
try {
	if (args[0].macroPass === "DamageBonus") {
		if (actor.flags?.dae?.onUpdateTarget && args[0].hitTargets.length > 0) {
			const isMarked = actor.flags.dae.onUpdateTarget.find(flag => 
					flag.flagName === "Hunter's Mark" && flag.sourceTokenUuid === args[0].hitTargetUuids[0]);
			if (isMarked) {
					let damageType = args[0].item.system.damage.parts[0][1];
					const diceMult = args[0].isCritical ? 2: 1;
					return {damageRoll: `${diceMult}d6[${damageType}]`, flavor: "Hunters Mark Damage"};
			}	
		}
		return {};
	} else if (args[0].macroPass === "preItemRoll") {
		// check if we are already marking and if the marked target is dead.
		const markedTarget = actor.flags.dae.onUpdateTarget.find(flag => flag.flagName === "Hunter's Mark")?.sourceTokenUuid;
		if (markedTarget) {
			const target = await fromUuid(markedTarget);
			if (!target || target.actor.system.attributes.hp.value <= 0) { //marked target is dead or removed so don't consume a resource
			const currentDuration = duplicate(actor.effects.find(ef => ef.label === game.i18n.localize("midi-qol.Concentrating")).duration);
				const useHookId = Hooks.on("dnd5e.preUseItem", (hookItem, config, options) => {
					if (hookItem !== item) return;
					options.configureDialog = false;
					config.consumeSpellLevel = false;
					Hooks.off("dnd5e.preUseItem", useHookId);
				});
				const effectHookId = Hooks.on("preCreateActiveEffect", (effect, data, options, user) => {
					if (effect.label === game.i18n.localize("midi-qol.Concentrating")) {
						effect.updateSource({"duration": currentDuration});
						Hooks.off("dnd5e.preCreateActiveEffect", effectHookId);
					}
					return true;
				})
			}
		}
		return true;
	}
} catch (err) {
	    console.error(`${args[0].itemData.name} - Hunter's Mark ${version}`, err);
		return {}
}
