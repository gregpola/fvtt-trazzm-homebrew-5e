/*
	At 3rd level, you gain the ability to decipher an opponent’s tactics and develop a counter to them. As a bonus action, you can make a Wisdom (Insight) check against a creature you can see that isn’t Incapacitated, contested by the target’s Charisma (Deception) check. If you succeed, you can use your Sneak Attack against that target even if you don’t have advantage on the attack roll, but not if you have disadvantage on it.

	This benefit lasts for 1 minute or until you successfully use this feature against a different target.
*/
const version = "10.1";
const optionName = "Insightful Fighting";
const lastArg = args[args.length - 1];

try {
	
	let rogue = canvas.tokens.get(lastArg.tokenId);
	const defender = lastArg.targets[0];

	let results = await game.MonksTokenBar.requestContestedRoll({token: rogue, request: 'skill:ins'},
		{token:defender,
		request:'skill:dec'},
		{silent:true, fastForward:false, flavor: `${optionName}`});

	let i=0;
	while (results.flags['monks-tokenbar'][`token${rogue.id}`].passed === "waiting" && i < 30) {
		await new Promise(resolve => setTimeout(resolve, 500));
		i++;
	}

	let result = results.flags["monks-tokenbar"][`token${rogue.id}`].passed;
	if (result === "won" || result === "tied") {
		// add effect to the target
		const effect = await findEffect(defender.actor, optionName, rogue.actor.uuid);
		if (effect) {
			await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: defender.actor.uuid, effects: [effect.id] });
		}
		
		const effectData = {
			label: `${optionName}`,
			icon: lastArg.item.img,
			origin: rogue.actor.uuid,
			duration: {startTime: game.time.worldTime, seconds: 60},
			transfer: false,
			disabled: false
		};
		
		await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: defender.actor.uuid, effects: [effectData] });
		ChatMessage.create({'content': `${rogue.name} gains an insightful advantage over ${defender.name}`})
	}

} catch (err) {
    console.error(`Insightful Fighting ${version}`, err);
}

async function findEffect(actor, effectName, origin) {
    let effectUuid = null;
    effectUuid = actor?.effects?.find(ef => ef.label === effectName && ef.origin === origin);
    return effectUuid;
}
