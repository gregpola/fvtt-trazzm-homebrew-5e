/*
	As a reaction to being poisoned or suffering poison damage, the drow can transfer the poison into its shadow, immediately ending any ongoing poison damage and the poisoned condition. Abrupt exposure to total darkness or magical light ends this effect. After a short rest, the drow’s shadow is no longer poisoned.
*/
const version = "10.0.0";
const optionName = "Poisonous Shadows";

try {
	const lastArg = args[args.length - 1];

	if (args[0].macroPass === "postActiveEffects") {
		let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		const actorToken = await canvas.tokens.get(lastArg.tokenId);
		
		// look for ongoing poison damage
		// flags.midi-qol.OverTime
		// k => k.filter(e => e.text !== 'ZEC')
		let overtimeEffects = actor.effects.filter(eff => eff.changes.find(i => (i.key === "flags.midi-qol.OverTime" && i.value.includes("damageType=poison"))));
		if (overtimeEffects && overtimeEffects.length > 0) {
			for (let effect of overtimeEffects) {
				await MidiQOL.socket().executeAsGM('removeEffects', {'actorUuid': actor.uuid, 'effects': [effect.id]});
			}
		}
		
		// look for poisoned effect
		let poisonedEffects = actor.effects.filter(eff => eff.label === "Poisoned");
		if (poisonedEffects && poisonedEffects.length > 0) {
			for (let effect of poisonedEffects) {
				await MidiQOL.socket().executeAsGM('removeEffects', {'actorUuid': actor.uuid, 'effects': [effect.id]});
			}
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
