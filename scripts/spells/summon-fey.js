/*
	You call forth a fey spirit. It manifests in an unoccupied space that you can see within range. This corporeal form
	uses the Fey Spirit stat block. When you cast the spell, choose a mood: Fuming, Mirthful, or Tricksy. The creature
	resembles a fey creature of your choice marked by the chosen mood, which determines one of the traits in its stat
	block. The creature disappears when it drops to 0 hit points or when the spell ends.

	The creature is an ally to you and your companions. In combat, the creature shares your initiative count, but it
	takes its turn immediately after yours. It obeys your verbal commands (no action required by you). If you don’t issue
	any, it takes the Dodge action and uses its move to avoid danger.

	At Higher Levels. When you cast this spell using a spell slot of 4th level or higher, use the higher level wherever
	the spell’s level appears in the stat block.
 */
const version = "11.0";
const optionName = "Summon Fey";
const summonFlag = "summon-fey";

try {
	if (args[0].macroPass === "postActiveEffects") {
		// Build and display options dialog
		let dialog = new Promise((resolve, reject) => {
			new Dialog({
				title: `${optionName}`,
				content: "<p>Which type of fey would you like to summon?</p>",
				buttons:
					{
						fuming: {
							label: '<p>Fuming</p>',
							callback: () => { resolve("fuming") }

						},
						mirthful: {
							label: '<p>Mirthful</p>',
							callback: () => { resolve("mirthful") }

						},
						tricksy: {
							label: '<p>Tricksy</p>',
							callback: () => { resolve("tricksy") }

						},
						cancel: {
							label: `Cancel`,
							callback: () => { resolve(null) }
						}
					}
			}).render(true);
		});

		let choice = await dialog;
		if (choice) {
			const spellLevel = workflow.castData.castLevel;
			const pb = actor.system.attributes.prof;
			let spellStat = actor.system.attributes.spellcasting;
			if (spellStat === "") spellStat = "wis";
			const spellMod = actor.system.abilities[spellStat].mod;
			const msakBonus = actor.system.bonuses.msak.attack ? Number(actor.system.bonuses.msak.attack) : 0;
			const toHitBonus = spellMod + pb + msakBonus;

			const summonName = `Fey Spirit (${actor.name})`;
			let hpValue = 30 + (10 * spellLevel - 3);

			let mightySummoner = actor.items.getName("Mighty Summoner");
			if (mightySummoner) {
				hpValue += 	(spellLevel * 2);
			}

			let updates = {
				token: {
					"name": summonName,
					"disposition": CONST.TOKEN_DISPOSITIONS.FRIENDLY,
					"displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
					"displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
					"bar1": { attribute: "attributes.hp" },
					"actorLink": false,
					"flags": {"midi-srd": { "Summoned Fey": { "ActorId": actor.id } }}
				},
				actor: {
					"name": summonName,
					"system": {
						"details.cr": pb,
						"attributes.ac.value": 12 + spellLevel,
						"attributes.hp": { value: hpValue, max: hpValue, formula: hpValue },
						"attributes.spelldc": actor.system.attributes.spelldc
					},
					"flags": {"fvtt-trazzm-homebrew-5e": { "spell-dc": actor.system.attributes.spelldc }}
				},
				embedded: {
					Item: {
						"Shortsword": {
							"system.attackBonus": `${toHitBonus}`,
							"system.damage.parts":[[`1d6 + 3 + ${spellLevel}`,"piercing"]]
						}
					}
				}
			};

			let summonActor = game.actors.getName(summonName);
			if (!summonActor) {
				// Get from the compendium
				const summonId = "hPJzWOfBhxUYc2Hh";
				let entity = await fromUuid("Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-actors." + summonId);
				if (!entity) {
					return ui.notifications.error(`${optionName} - unable to find the actor`);
				}

				// import the actor
				let document = await entity.collection.importFromCompendium(game.packs.get(entity.pack), summonId, updates);
				if (!document) {
					return ui.notifications.error(`${optionName} - unable to import from the compendium`);
				}
				await warpgate.wait(500);
				await document.update({ "name" : summonName });
				summonActor = game.actors.getName(summonName);
			}

			const maxRange = item.system.range.value ? item.system.range.value : 90;
			let position = await HomebrewMacros.warpgateCrosshairs(token, maxRange, item, summonActor.prototypeToken);
			if (position) {
				const result = await warpgate.spawnAt(position, summonName, updates, {controllingActor: actor});
				if (!result || !result[0]) {
					return ui.notifications.error(`${optionName} - Missing ${summonName} actor`);
				}

				let feySpirit = canvas.tokens.get(result[0]);
				if (feySpirit) {
					await actor.setFlag("fvtt-trazzm-homebrew-5e", summonFlag, feySpirit.id);
					await anime(token, feySpirit);
					await feySpirit.toggleCombat();
					const objectInitiative = token.combatant.initiative ? token.combatant.initiative - .01
						: 1 + (feySpirit.actor.system.abilities.dex.value / 100);
					await feySpirit.combatant.update({initiative: objectInitiative});
				}
			}
		}
	}
	else if (args[0] === "off") {
		// delete the summons
		const summonId = actor.getFlag("fvtt-trazzm-homebrew-5e", summonFlag);
		if (summonId) {
			await actor.unsetFlag("fvtt-trazzm-homebrew-5e", summonFlag);
			
			let tokens = canvas.tokens.ownedTokens.filter(i => i.id === summonId);
			for (let i = 0; i < tokens.length; i++) {
				await warpgate.dismiss(tokens[i].id, game.canvas.scene.id);
			}
		}
	}
	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}

async function anime(token, target) {
	new Sequence()
		.effect()
		.file("jb2a.misty_step.01.purple")
		.atLocation(target)
		.scaleToObject(1)
		.play();
}