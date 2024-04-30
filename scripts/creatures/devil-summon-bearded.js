/*
	The devil chooses what to summon and attempts a magical summoning.

	A bearded devil has a 30 percent chance of summoning one bearded devil.

	A summoned devil appears in an unoccupied space within 60 feet of its summoner, acts as an ally of its summoner, and can’t summon other devils. It remains for 1 minute, until it or its summoner dies, or until its summoner dismisses it as an action.
*/
const version = "11.0";
const optionName = "Summon Bearded Devil";
const summonFlag = "summon-bearded-devil";
const summonId = "pgrp2yAfxDROUfHF";
const _flagGroup = "fvtt-trazzm-homebrew-5e";

try {
	if (args[0].macroPass === "preItemRoll") {
		// roll failure chance
		let chanceRoll = await new Roll(`1d100`).evaluate({ async: true });
		await game.dice3d?.showForRoll(chanceRoll);		
		return (chanceRoll.total <= 30);
	}
	else if (args[0] === "on") {
        if (!game.modules.get("warpgate")?.active) ui.notifications.error("Please enable the Warp Gate module");

		// build the update data to match summoned traits
		const summonName = `Bearded Devil (Summoned)`;
		let updates = {
			token: {
				"name": summonName,
				"disposition": token.document.disposition,
				"displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
				"displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
				"bar1": { attribute: "attributes.hp" },
				"actorLink": false,
				"flags": { "midi-srd": { "Summoned Devil" : { "ActorId": actor.id } } }
			},
			"name": summonName
		};
		
		let summonActor = game.actors.getName(summonName);
		if (!summonActor) {
			// Get from the compendium
			let entity = await fromUuid("Compendium.fvtt-trazzm-homebrew-5e.homebrew-creatures." + summonId);
			if (!entity) {
				ui.notifications.error(`${optionName} - unable to find the actor`);
				return false;
			}

			// import the actor
			let document = await entity.collection.importFromCompendium(game.packs.get(entity.pack), summonId, updates);
			if (!document) {
				ui.notifications.error(`${optionName} - unable to import from the compendium`);
				return false;
			}
			await warpgate.wait(500);
			summonActor = game.actors.getName(summonName);
		}
		
		// Spawn the result
		const maxRange = 60;
		let position = await HomebrewMacros.warpgateCrosshairs(token, maxRange, item, summonActor.prototypeToken, 5);
		if (position) {
			// check for token collision
			const newCenter = canvas.grid.getSnappedPosition(position.x - summonActor.prototypeToken.width / 2, position.y - summonActor.prototypeToken.height / 2, 1);
			if (HomebrewMacros.checkPosition(summonActor, newCenter.x, newCenter.y)) {
				ui.notifications.error(`${optionName} - can't teleport on top of another token`);
				return false;
			}

			const result = await warpgate.spawnAt(position, summonName, updates, { controllingActor: actor }, {});
			if (!result || !result[0]) {
				ui.notifications.error(`${optionName} - Unable to spawn`);
				return false;
			}

			let summonedToken = canvas.tokens.get(result[0]);
			if (summonedToken) {
				await anime(token, summonedToken);
				await actor.setFlag("midi-qol", summonFlag, summonedToken.id);
				await summonedToken.toggleCombat();
				await summonedToken.actor.rollInitiative();
			}
			
		}
		else {
			ui.notifications.error(`${optionName} - invalid summon location`);
			return false;
		}
	}
	else if (args[0] === "off") {
		// delete the summon
		const lastSummon = actor.getFlag("midi-qol", summonFlag);
		if (lastSummon) {
			await actor.unsetFlag("midi-qol", summonFlag);
			await warpgate.dismiss(lastSummon, game.canvas.scene.id);
		}
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function anime(token, target) {
    new Sequence()
        .effect()
        .file("jb2a.misty_step.01.red")       
        .atLocation(target)
		.scaleToObject(1)
		.play();
}