const version = "0.1.0";
const optionName = "Accursed Specter";
//const collectionName = "fvtt-trazzm-homebrew-5e.homebrew-creatures";
let specterName;

try {
	const lastArg = args[args.length - 1];
	let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	specterName = "Specter (" + actor.name + ")";
	
	if (args[0] === "on") {		
		// calculate the mods
		const levels = actor.classes?.warlock?.data?.data?.levels ?? 0;
		const tempHp = Math.ceil(levels / 2);
		const charMod = Math.max(0, actor.data.data.abilities.cha.mod);

		// summon the specter
		// TODO update the attack bonus
        let updates = {
            token: {
                "name": specterName, 
				"disposition": 1,
				"flags": { "midi-srd": { "Accursed Specter": { "ActorId": actor.id } } }
            },
            actor: {
                "name": specterName,
                "data": { 
					"attributes.hp.temp": tempHp,
					"bonuses" : {
						"msak.attack" : charMod,
						"mwak.attack" : charMod,
						"rsak.attack" : charMod,
						"rwak.attack" : charMod
					}
				}
            }
        }

        const result = await warpgate.spawn("Specter", updates, { controllingActor: actor });
		if (!result || !result[0]) {
			return ui.notifications.error(`${optionName} - Missing specter actor`);
		}		
	
		let specterToken = canvas.tokens.get(result[0]);
		if (specterToken) {
			const res = await specterToken.toggleCombat();
			await specterToken.combatant?.rollInitiative(`1d20 + ${specterToken.document.actor.data.data.abilities.dex.mod}`);
		}
		
		// Save the Specter id on the actor
		await actor.setFlag("midi-qol", "accursed-specter", result[0]);
		
	}
	else if (args[0] === "off") {
		// delete the Specter
		const lastSpecter = actor.getFlag("midi-qol", "accursed-specter");
		if (lastSpecter) await actor.unsetFlag("midi-qol", "accursed-specter");
        await MidiMacros.deleteTokens("Accursed Specter", actor)

	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}
