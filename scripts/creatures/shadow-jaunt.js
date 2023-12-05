/*
	As a bonus action, the spider can magically shift from the Material Plane to the Ethereal Plane, or vice versa.
*/
const version = "11.0";
const optionName = "Shadow Jaunt";
const flagName = "shadow-jaunt-effects";
const mutationFlag = "shadow-jaunt-mutation";

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
		await actor.setFlag("fvtt-trazzm-homebrew-5e", flagName, disabledEffects);

		const updates = {
			actor: {
				'system.traits.di.all': true,
				'system.details.type.custom' : 'NoTarget'
			}
		};
		await warpgate.mutate(token.document, updates, {}, { name: mutationFlag });

		await token.document.update({ "hidden": true });
		await ChatMessage.create({ content: `${actor.name} has vanished`});
	}
	else if (args[0] === "off") {
		const flag = actor.getFlag("fvtt-trazzm-homebrew-5e", flagName);
		if (flag) {
			await actor.unsetFlag("fvtt-trazzm-homebrew-5e", flagName);

			for (let effectId of flag) {
				let effect = actor.effects.find(e => e.id === effectId);
				if (effect) {
					await effect.update({disabled: false});
				}
			}
		}

		await warpgate.revert(token.document, mutationFlag);
		await token.document.update({ "hidden": false });
		await ChatMessage.create({ content: `${actor.name} returns`});
	}

} catch (err) {
	console.error(`${optionName}: ${version}`, err);
}