/*
	As a bonus action, the spider can magically shift from the Material Plane to the Ethereal Plane, or vice versa.
*/
const version = "12.3.0";
const optionName = "Shadow Jaunt";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const flagName = "shadow-jaunt-effects";

try {
	if (args[0] === "on") {
		// disable all active effects
		let disabledEffects = [];
		for (let effect of actor.effects) {
			if (!effect.disabled && effect.name !== optionName) {
				await effect.update({disabled: true});
				disabledEffects.push(effect.id);
			}
		}
		await actor.setFlag(_flagGroup, flagName, disabledEffects);

		// hide the token
		await HomebrewEffects.applyEtherealEffect(actor, macroItem.uuid);
		await ChatMessage.create({ content: `${actor.name} has vanished`});
	}
	else if (args[0] === "off") {
		const flag = actor.getFlag(_flagGroup, flagName);
		if (flag) {
			await actor.unsetFlag(_flagGroup, flagName);

			for (let effectId of flag) {
				let effect = actor.effects.find(e => e.id === effectId);
				if (effect) {
					await effect.update({disabled: false});
				}
			}
		}

		await HomebrewEffects.removeEffectByNameAndOrigin(actor, 'Ethereal', macroItem.uuid);
		await ChatMessage.create({ content: `${actor.name} returns`});
	}

} catch (err) {
	console.error(`${optionName}: ${version}`, err);
}
