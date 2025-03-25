/*
	Starting at 6th level, you can curse the soul of a person you slay, temporarily binding it to your service. When you
	slay a humanoid, you can cause its spirit to rise from its corpse as a specter, the statistics for which are in the
	Monster Manual. When the specter appears, it gains temporary hit points equal to half your warlock level. Roll
	initiative for the specter, which has its own turns. It obeys your verbal commands, and it gains a special bonus to
	its attack rolls equal to your Charisma modifier (minimum of +0).

	The specter remains in your service until the end of your next long rest, at which point it vanishes to the afterlife.

	Once you bind a specter with this feature, you can’t use the feature again until you finish a long rest.
*/
const version = "11.0";
const optionName = "Accursed Specter";
const specterFlag = "accursed-specter";
const _summonId = "Compendium.fvtt-trazzm-homebrew-5e.homebrew-creatures.qnxud9vdRFrHwJlP";
const _specterId = "qnxud9vdRFrHwJlP";

try {
	if (args[0] === "on") {
		// calculate the mods
		const levels = actor.getRollData().classes?.warlock?.levels ?? 0;
		const tempHp = Math.ceil(levels / 2);
		const charMod = Math.max(0, actor.system.abilities.cha.mod);

		// build the update data to match summoned traits
		const summonName = `${optionName} (${actor.name})`;
		let updates = {
			"name": summonName,
			token: {
				"name": summonName,
				"disposition": CONST.TOKEN_DISPOSITIONS.FRIENDLY,
				"displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
				"displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
				"bar1": { attribute: "attributes.hp" },
				"actorLink": false,
			},
			actor: {
				"system": {
					"attributes.hp.temp": tempHp,
					"bonuses" : {
						"msak.attack" : charMod,
						"mwak.attack" : charMod,
						"rsak.attack" : charMod,
						"rwak.attack" : charMod
					}
				}
			}
		};

		let summonActor = game.actors.getName(summonName);
		if (!summonActor) {
			let entity = await fromUuid(_summonId);
			if (!entity) {
				console.error(`${optionName} - unable to find a specter in the compendium!!!`);
				ui.notifications.error(`${optionName} - unable to find a specter in the compendium!!!`);
				return;
			}

			// import the actor
			let document = await entity.collection.importFromCompendium(game.packs.get(entity.pack), _specterId, updates);
			if (!document) {
				console.error(`${optionName} - unable to import from the compendium`);
				ui.notifications.error(`${optionName} - unable to import from the compendium`);
				return;
			}
			await warpgate.wait(500);
			summonActor = game.actors.getName(summonName);
		}

		// Spawn the result
		const maxRange = item.system.range.value ? item.system.range.value : 120;
		let position = await HomebrewMacros.warpgateCrosshairs(token, maxRange, item, summonActor.prototypeToken);
		if (position) {
			let options = {duplicates: 0, collision: true};
			let spawned = await warpgate.spawnAt(position, summonName, updates, { controllingActor: actor }, options);
			if (!spawned || !spawned[0]) {
				ui.notifications.error(`${optionName} - unable to spawn the animals`);
				return false;
			}

			let summonedToken = canvas.tokens.get(spawned[0]);
			if (summonedToken) {
				await anime(token, summonedToken);
				await summonedToken.toggleCombat();
				await summonedToken.actor.rollInitiative();
				await actor.setFlag("fvtt-trazzm-homebrew-5e", specterFlag, summonedToken.id);
			}
		}
		else {
			ui.notifications.error(`${optionName} - invalid summon location`);
		}
	}
	else if (args[0] === "off") {
		// delete the Specter
		const lastSpecter = actor.getFlag("fvtt-trazzm-homebrew-5e", specterFlag);
		if (lastSpecter) {
			await actor.unsetFlag("fvtt-trazzm-homebrew-5e", specterFlag);
			await warpgate.dismiss(lastSpecter, game.canvas.scene.id);
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function anime(token, target) {
	new Sequence()
		.effect()
		.file("jb2a.misty_step.01.purple")
		.atLocation(target)
		.scaleToObject(2)
		.play();
}
