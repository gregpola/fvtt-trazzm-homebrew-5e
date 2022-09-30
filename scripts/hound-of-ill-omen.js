const version = "0.1.0";
const resourceName = "Sorcery Points";
const optionName = "Hound of Ill Omen";
const cost = 3;

try {
	const lastArg = args[args.length - 1];
	let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	
	if (args[0] === "on") {
		// check resources
		let resKey = findResource(actor);
		if (!resKey) {
			return ui.notifications.error(`${resourceName} - no resource found`);
		}

		const points = actor.data.data.resources[resKey].value;
		if (!points) {
			return ui.notifications.error(`${resourceName} - resource pool is empty`);
		}
		
		if (points < cost) {
			return ui.notifications.error(`${resourceName} - not enough ${resourceName} (need ${cost})`);
		}
		
		// summon the hound
		let updates = {
			token: { "flags": { "midi-srd": { "Hound of Ill Omen": { "ActorId": actor.id } } } }
		};
		const result = await warpgate.spawn("Hound of Ill Omen",  updates, {}, {controllingActor: actor});
		if (result.length !== 1) {
			return;
		}
		
		// add the temp HP
		const levels = actor.classes?.sorcerer?.data?.data?.levels ?? 0;
		const tempHp = Math.floor(levels / 2);
		
		let houndToken = canvas.tokens.get(result[0]);
		if (houndToken) {
			houndToken.document.actor.update({data:{attributes:{hp:{temp: tempHp}}}});
			const res = await houndToken.toggleCombat();
			//await houndToken.document.actor.rollInitiative({createCombatants: false, rerollInitiative: true});
			await houndToken.combatant?.rollInitiative(`1d20 + ${houndToken.document.actor.data.data.abilities.dex.mod}`);
		}
		
		// Save the hound id on the actor
		await actor.setFlag("midi-qol", "hound-of-ill-omen", result[0]);
		await consumeResource(actor, resKey, cost);
		
	}
	else if (args[0] === "off") {
		// delete the hound
		const lastHound = actor.getFlag("midi-qol", "hound-of-ill-omen");
		if (lastHound) await actor.unsetFlag("midi-qol", "hound-of-ill-omen");
        await MidiMacros.deleteTokens("Hound of Ill Omen", actor)

	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}

function findResource(actor) {
	for (let res in actor.data.data.resources) {
		if (actor.data.data.resources[res].label === resourceName) {
		  return res;
		}
    }
	
	return null;
}

// handle resource consumption
async function consumeResource(actor, resKey, cost) {
	if (actor && resKey && cost) {
		const points = actor.data.data.resources[resKey].value;
		const pointsMax = actor.data.data.resources[resKey].max;
		let resources = duplicate(actor.data.data.resources);
		resources[resKey].value = Math.clamped(points - cost, 0, pointsMax);
		await actor.update({"data.resources": resources});
	}
}
