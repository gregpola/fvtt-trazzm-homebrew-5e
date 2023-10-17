/*
	As an action, you can attempt to stanch the wound with a successful DC 12 Wisdom (Medicine) check.
*/
const version = "10.0.0";
const optionName = "Stanch the Wound";

try {
	if (args[0].macroPass === "postActiveEffects") {
		const lastArg = args[args.length - 1];
		const actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
		const actorToken = canvas.tokens.get(lastArg.tokenId);

		// look for a wound
		let flag = DAE.getFlag(actorToken, "infernal-wounds");
		if (flag) {
			const roll = await actor.rollSkill('med', {targetValue: 12});
			await game.dice3d?.showForRoll(roll);
			if (roll.total >= 12) {
				actor.deleteEmbeddedEntity("ActiveEffect", flag.effectId);
				await warpgate.revert(actorToken.document, 'Stanch the Wound');
				ChatMessage.create({'content': '" + token.name + " stops the bleeding!'});
			}
		}
		else {
			await warpgate.revert(actorToken.document, 'Stanch the Wound');
		}
	}

} catch (err) {
    console.error(`${optionName}: v${version}`, err);
}
