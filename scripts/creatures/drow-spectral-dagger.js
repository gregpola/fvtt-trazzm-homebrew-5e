/*
	The drow conjures a floating, spectral dagger within 60 feet of itself. The drow can make a melee spell attack (+10 to hit) against one creature within 5 feet of the dagger. On a hit, the target takes 9 (1d8 + 5) force damage.

	The dagger lasts for 1 minute. As a bonus action on later turns, the drow can move the dagger up to 20 feet and repeat the attack against one creature within 5 feet of the dagger.
*/
const version = "11.0";
const optionName = "Spectral Dagger";
const actorName = "Spectral Dagger";
const summonFlag = "spectral-dagger";
const _flagGroup = "fvtt-trazzm-homebrew-5e";

try {
	if (args[0] === "on") {
        if (!game.modules.get("warpgate")?.active) ui.notifications.error("Please enable the Warp Gate module")

		let spellStat = actor.system.attributes.spellcasting;
		if (spellStat === "") spellStat = "cha";

		const summonName = `${actorName} (${actor.name})`;
		const updates = {
            token: {
				"name": summonName,
				"disposition": token.document.disposition,
				"displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
				"displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
				"bar1": { attribute: "attributes.hp" },
				"actorLink": false,
				"flags": { "fvtt-trazzm-homebrew-5e": { "Spectral Dagger": { "ActorId": actor.id } } }
			},
			"name": summonName
		};

        let summonActor = game.actors.getName(summonName);
        if (!summonActor) {
			// Get from the compendium
			const summonId = "bS3OYvsFjCuPunO9";
			let entity = await fromUuid("Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-actors." + summonId);
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
		let position = await HomebrewMacros.warpgateCrosshairs(token, maxRange, item, summonActor.prototypeToken);
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
				await actor.setFlag(_flagGroup, summonFlag, summonedToken.id);
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
		const lastSummon = actor.getFlag(_flagGroup, summonFlag);
		if (lastSummon) {
			await actor.unsetFlag(_flagGroup, summonFlag);
			await warpgate.dismiss(lastSummon, game.canvas.scene.id);
		}
	}
	
} catch (err)  {
    console.error(`${optionName}: ${version}`, err);
}

async function anime(token, target) {
    new Sequence()
        .effect()
        .file("jb2a.misty_step.01.blue")       
        .atLocation(target)
		.scaleToObject(1)
		.play();
}