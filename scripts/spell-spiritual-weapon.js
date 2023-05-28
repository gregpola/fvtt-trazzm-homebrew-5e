/*
	You create a floating, spectral weapon within range that lasts for the duration or until you cast this spell again. When you cast the spell, you can make a melee spell attack against a creature within 5 feet of the weapon. On a hit, the target takes force damage equal to 1d8 + your spellcasting ability modifier.

	As a bonus action on your turn, you can move the weapon up to 20 feet and repeat the attack against a creature within 5 feet of it.

	The weapon can take whatever form you choose. Clerics of deities who are associated with a particular weapon (as St. Cuthbert is known for his mace and Thor for his hammer) make this spell's effect resemble that weapon.

	Higher Levels. When you cast this spell using a spell slot of 3rd level or higher, the damage increases by 1d8 for every two slot levels above the 2nd.
*/
const version = "10.5";
const optionName = "Spiritual Weapon";
const actorName = "Spiritual Weapon";
const summonFlag = "spiritual-weapon";

const weaponTypes = ["Club", "Dagger", "Falchion", "Greataxe", "Greatsword", "Halberd", "Hammer", "Handaxe", "Katana", "Longsword", "Mace", "Maul", "Quarterstaff", "Rapier", "Scimitar", "Scythe", "Shortsword", "Spear", "Trident", "Warhammer"];
const colorButtons = [{label: "Blue", value: 0}, {label: "Green", value: 1}, {label: "Purple", value: 2}];
const weaponTokens = [
	["SpiritualWeapon_Club01_01_Astral_Blue_400x400.webm", "SpiritualWeapon_Club01_02_Spectral_Green_400x400.webm", "SpiritualWeapon_Club01_01_Astral_Purple_400x400.webm"],
	["SpiritualWeapon_Dagger02_01_Astral_Blue_400x400.webm", "SpiritualWeapon_Dagger02_02_Spectral_Green_Thumb.webp", "SpiritualWeapon_Dagger02_01_Astral_Purple_400x400.webm"],
	["SpiritualWeapon_Falchion01_01_Astral_Blue_400x400.webm", "SpiritualWeapon_Falchion01_02_Spectral_Green_400x400.webm", "SpiritualWeapon_Falchion01_01_Astral_Purple_400x400.webm"],
	["SpiritualWeapon_GreatAxe01_01_Astral_Blue_400x400.webm", "SpiritualWeapon_GreatAxe01_02_Spectral_Green_400x400.webm", "SpiritualWeapon_GreatAxe01_01_Astral_Purple_400x400.webm"],
	["SpiritualWeapon_GreatSword01_01_Liquid_Blue_400x400.webm", "SpiritualWeapon_GreatSword01_02_Spectral_Green_400x400.webm", "SpiritualWeapon_GreatSword01_01_Astral_Purple_400x400.webm"],
	["SpiritualWeapon_Halberd01_01_Astral_Blue_400x400.webm", "SpiritualWeapon_Halberd01_02_Spectral_Green_400x400.webm", "SpiritualWeapon_Halberd01_01_Astral_Purple_400x400.webm"],
	["SpiritualWeapon_Hammer01_01_Astral_Blue_400x400.webm", "SpiritualWeapon_Hammer01_02_Spectral_Green_400x400.webm", "SpiritualWeapon_Hammer02_01_Astral_Purple_400x400.webm"],
	["SpiritualWeapon_HandAxe01_01_Astral_Blue_400x400.webm", "SpiritualWeapon_HandAxe01_02_Spectral_Green_400x400.webm", "SpiritualWeapon_HandAxe01_01_Astral_Purple_400x400.webm"],
	["SpiritualWeapon_Katana01_01_Astral_Blue_400x400.webm", "SpiritualWeapon_Katana01_02_Spectral_Green_400x400.webm", "SpiritualWeapon_Katana01_01_Astral_Purple_400x400.webm"],
	["SpiritualWeapon_LongSword01_01_Astral_Blue_400x400.webm", "SpiritualWeapon_LongSword01_02_Spectral_Green_400x400.webm", "SpiritualWeapon_LongSword01_01_Astral_Purple_400x400.webm"],
	["SpiritualWeapon_Mace01_01_Astral_Blue_400x400.webm", "SpiritualWeapon_Mace01_02_Spectral_Green_400x400.webm", "SpiritualWeapon_Mace01_01_Astral_Purple_400x400.webm"],
	["SpiritualWeapon_Maul01_01_Astral_Blue_400x400.webm", "SpiritualWeapon_Maul01_02_Spectral_Green_400x400.webm", "SpiritualWeapon_Maul01_01_Astral_Purple_400x400.webm"],
	["SpiritualWeapon_Quarterstaff01_01_Astral_Blue_400x400.webm", "SpiritualWeapon_Quarterstaff01_02_Spectral_Green_400x400.webm", "SpiritualWeapon_Quarterstaff01_01_Astral_Purple_400x400.webm"],
	["SpiritualWeapon_Rapier01_01_Astral_Blue_400x400.webm", "SpiritualWeapon_Rapier01_02_Spectral_Green_400x400.webm", "SpiritualWeapon_Rapier01_01_Astral_Purple_400x400.webm"],
	["SpiritualWeapon_Scimitar01_01_Astral_Blue_400x400.webm", "SpiritualWeapon_Scimitar01_02_Spectral_Green_400x400.webm", "SpiritualWeapon_Scimitar01_01_Astral_Purple_400x400.webm"],
	["SpiritualWeapon_Scythe01_01_Astral_Blue_400x400.webm", "SpiritualWeapon_Scythe01_02_Spectral_Green_400x400.webm", "SpiritualWeapon_Scythe01_01_Astral_Purple_400x400.webm"],
	["SpiritualWeapon_Shortsword01_01_Astral_Blue_400x400.webm", "SpiritualWeapon_Shortsword01_02_Spectral_Green_400x400.webm", "SpiritualWeapon_Shortsword01_01_Astral_Purple_400x400.webm"],
	["SpiritualWeapon_Spear01_01_Astral_Blue_400x400.webm", "SpiritualWeapon_Spear01_02_Spectral_Green_400x400.webm", "SpiritualWeapon_Spear01_01_Astral_Purple_400x400.webm"],
	["SpiritualWeapon_Trident01_01_Astral_Blue_400x400.webm", "SpiritualWeapon_Trident01_02_Spectral_Green_400x400.webm", "SpiritualWeapon_Trident01_01_Astral_Purple_400x400.webm"],
	["SpiritualWeapon_Warhammer01_01_Astral_Blue_400x400.webm", "SpiritualWeapon_Warhammer01_02_Spectral_Green_400x400.webm", "SpiritualWeapon_Warhammer01_01_Astral_Purple_400x400.webm"]
];

const weaponPortraits = [
	["SpiritualWeapon_Club01_01_Astral_Blue_Thumb.webp", "SpiritualWeapon_Club01_02_Spectral_Green_Thumb.webp", "SpiritualWeapon_Club01_01_Astral_Purple_Thumb.webp"],
	["SpiritualWeapon_Dagger02_01_Astral_Blue_Thumb.webp", "SpiritualWeapon_Dagger02_02_Spectral_Green_Thumb.webp", "SpiritualWeapon_Dagger02_01_Astral_Purple_Thumb.webp"],
	["SpiritualWeapon_Falchion01_01_Astral_Blue_Thumb.webp", "SpiritualWeapon_Falchion01_02_Spectral_Green_Thumb.webp", "SpiritualWeapon_Falchion01_01_Astral_Purple_Thumb.webp"],
	["SpiritualWeapon_GreatAxe01_01_Astral_Blue_Thumb.webp", "SpiritualWeapon_GreatAxe01_02_Spectral_Green_Thumb.webp", "SpiritualWeapon_GreatAxe01_01_Astral_Purple_Thumb.webp"],
	["SpiritualWeapon_GreatSword01_01_Astral_Blue_Thumb.webp", "SpiritualWeapon_GreatSword01_02_Spectral_Green_Thumb.webp", "SpiritualWeapon_GreatSword01_01_Astral_Purple_Thumb.webp"],
	["SpiritualWeapon_Halberd01_01_Astral_Blue_Thumb.webp", "SpiritualWeapon_Halberd01_02_Spectral_Green_Thumb.webp", "SpiritualWeapon_Halberd01_01_Astral_Purple_Thumb.webp"],
	["SpiritualWeapon_Hammer01_01_Astral_Blue_Thumb.webp", "SpiritualWeapon_Hammer01_02_Spectral_Green_Thumb.webp", "SpiritualWeapon_Hammer01_01_Astral_Purple_Thumb.webp"],
	["SpiritualWeapon_HandAxe01_01_Astral_Blue_Thumb.webp", "SpiritualWeapon_HandAxe01_02_Spectral_Green_Thumb.webp", "SpiritualWeapon_HandAxe01_01_Astral_Purple_Thumb.webp"],
	["SpiritualWeapon_Katana01_01_Astral_Blue_Thumb.webp", "SpiritualWeapon_Katana01_02_Spectral_Green_Thumb.webp", "SpiritualWeapon_Katana01_01_Astral_Purple_Thumb.webp"],
	["SpiritualWeapon_LongSword01_01_Astral_Blue_Thumb.webp", "SpiritualWeapon_LongSword01_02_Spectral_Green_Thumb.webp", "SpiritualWeapon_LongSword01_01_Astral_Purple_Thumb.webp"],
	["SpiritualWeapon_Mace01_01_Astral_Blue_Thumb.webp", "SpiritualWeapon_Mace01_01_Flaming_Green_Thumb.webp", "SpiritualWeapon_Mace01_01_Astral_Purple_Thumb.webp"],
	["SpiritualWeapon_Maul01_01_Flaming_Blue_Thumb.webp", "SpiritualWeapon_Maul01_01_Flaming_Green_Thumb.webp", "SpiritualWeapon_Maul01_01_Flaming_Purple_Thumb.webp"],
	["SpiritualWeapon_Quarterstaff01_01_Astral_Blue_Thumb.webp", "SpiritualWeapon_Quarterstaff01_02_Spectral_Green_Thumb.webp", "SpiritualWeapon_Quarterstaff01_01_Astral_Purple_Thumb.webp"],
	["SpiritualWeapon_Rapier01_01_Astral_Blue_Thumb.webp", "SpiritualWeapon_Rapier01_02_Spectral_Green_Thumb.webp", "SpiritualWeapon_Rapier01_01_Astral_Purple_Thumb.webp"],
	["SpiritualWeapon_Scimitar01_01_Astral_Blue_Thumb.webp", "SpiritualWeapon_Scimitar01_02_Spectral_Green_Thumb.webp", "SpiritualWeapon_Scimitar01_01_Astral_Purple_Thumb.webp"],
	["SpiritualWeapon_Scythe01_01_Astral_Blue_Thumb.webp", "SpiritualWeapon_Scythe01_02_Spectral_Green_Thumb.webp", "SpiritualWeapon_Scythe01_01_Astral_Purple_Thumb.webp"],
	["SpiritualWeapon_Shortsword01_01_Astral_Blue_Thumb.webp", "SpiritualWeapon_Shortsword01_02_Spectral_Green_Thumb.webp", "SpiritualWeapon_Shortsword01_01_Astral_Purple_Thumb.webp"],
	["SpiritualWeapon_Spear01_01_Astral_Blue_Thumb.webp", "SpiritualWeapon_Spear01_02_Spectral_Green_Thumb.webp", "SpiritualWeapon_Spear01_01_Astral_Purple_Thumb.webp"],
	["SpiritualWeapon_Trident01_01_Astral_Blue_Thumb.webp", "SpiritualWeapon_Trident01_02_Spectral_Green_Thumb.webp", "SpiritualWeapon_Trident01_01_Astral_Purple_Thumb.webp"],
	["SpiritualWeapon_Warhammer01_01_Astral_Blue_Thumb.webp", "SpiritualWeapon_Warhammer01_02_Spectral_Green_Thumb.webp", "SpiritualWeapon_Warhammer01_01_Astral_Purple_Thumb.webp"]
];

try {
	const lastArg = args[args.length - 1];
	const caster = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
	const actorToken = canvas.tokens.get(lastArg.tokenId);

	if (args[0] === "on") {
        if (!game.modules.get("warpgate")?.active) ui.notifications.error("Please enable the Warp Gate module")
		
		const sourceItem = await fromUuid(lastArg.origin);
		const spellLevel = Number(args[1]);
		const attackDice = 1 + Math.floor((spellLevel-2)/2);

		let spellStat = caster.system.attributes.spellcasting;
		if (spellStat === "") spellStat = "wis";
		const spellMod = caster.system.abilities[spellStat].mod;
		const pb = caster.system.attributes.prof;
		const msakBonus = caster.system.bonuses.msak.attack ? Number(caster.system.bonuses.msak.attack) : 0;
		const toHitBonus = spellMod + pb + msakBonus;

		const summonName = `${actorName} (${caster.name})`;
		let updates = {
            token: {
				"name": summonName,
				"disposition": CONST.TOKEN_DISPOSITIONS.FRIENDLY,
				"displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
				"displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
				"bar1": { attribute: "attributes.hp" },
				"actorLink": false,
			},
			"name": summonName,	
			embedded: {
				Item: {
					"Spiritual Weapon Attack": {
						"system.proficient": false,
						"system.properties.mgc": true,
						"system.attackBonus": `${toHitBonus}`,
						"system.damage.parts":[[`${attackDice}d8 + ${spellMod}`,"force"]]
					}
				}
			}
		};

        let summonActor = game.actors.getName(summonName);
        if (!summonActor) {
			// Get from the compendium
			const summonId = "eeBrDDxFDlAQNXym";
			let entity = await fromUuid("Compendium.fvtt-trazzm-homebrew-5e.homebrew-automation-actors." + summonId);
			if (!entity) {
				ui.notifications.error(`${optionName} - unable to find the actor`);
				return;
			}

			// ask which form and color for the weapon to have
			const result = await warpgate.menu(
				{
					inputs:[{type:"select", label: "Weapon Form", options: weaponTypes}],
					buttons: colorButtons
				},
				{title:`${optionName}: Flavor`});

			// if closed, just use the default values
			if (result) {
				//let x = weaponTypes.indexOf(result.inputs[0]);
				let x = weaponTypes.findIndex((a) => a.value === result.inputs[0]);
				let y = result.buttons;
				let tokenImage = weaponTokens[x][y];
				let actorPortrait = weaponPortraits[x][y];

				updates = {
					'name': summonName,
					'img': `modules/jb2a_patreon/Library/2nd_Level/Spiritual_Weapon/${actorPortrait}`,
					'prototypeToken': {
						'name': summonName,
						"disposition": CONST.TOKEN_DISPOSITIONS.FRIENDLY,
						"displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
						"displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
						"bar1": { attribute: "attributes.hp" },
						'texture': {
							'src': `modules/jb2a_patreon/Library/2nd_Level/Spiritual_Weapon/${tokenImage}`
						}
					},
					'token': {
						'name': summonName,
						"disposition": CONST.TOKEN_DISPOSITIONS.FRIENDLY,
						"displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
						"displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
						"bar1": { attribute: "attributes.hp" },
						'texture': {
							'src': `modules/jb2a_patreon/Library/2nd_Level/Spiritual_Weapon/${tokenImage}`
						}
					},
					embedded: {
						Item: {
							"Spiritual Weapon Attack": {
								"system.proficient": false,
								"system.properties.mgc": true,
								"system.attackBonus": `${toHitBonus}`,
								"system.damage.parts":[[`${attackDice}d8 + ${spellMod}`,"force"]]
							}
						}
					}
				};
			}

			// import the actor
			let document = await entity.collection.importFromCompendium(game.packs.get(entity.pack), summonId, updates);
			if (!document) {
				ui.notifications.error(`${optionName} - unable to import from the compendium`);
				return;
			}
			await warpgate.wait(500);
			summonActor = game.actors.getName(summonName);
		}
		
		// Spawn the result
		const maxRange = sourceItem.system.range.value ? sourceItem.system.range.value : 60;
		let position = await HomebrewMacros.warpgateCrosshairs(actorToken, maxRange, sourceItem, summonActor.prototypeToken);
		if (position) {
			// check for token collision
			const newCenter = canvas.grid.getSnappedPosition(position.x - summonActor.prototypeToken.width / 2, position.y - summonActor.prototypeToken.height / 2, 1);
			if (HomebrewMacros.checkPosition(newCenter.x, newCenter.y)) {
				ui.notifications.error(`${optionName} - can't teleport on top of another token`);
				return;
			}

			const result = await warpgate.spawnAt(position, summonName, updates, { controllingActor: actor }, {});
			if (!result || !result[0]) {
				ui.notifications.error(`${optionName} - Unable to spawn`);
				return;
			}

			let summonedToken = canvas.tokens.get(result[0]);
			if (summonedToken) {
				await anime(actorToken, summonedToken);
				await actor.setFlag("midi-qol", summonFlag, summonedToken.id);
			}
			
		}
		else {
			ui.notifications.error(`${optionName} - invalid summon location`);
			return;
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
	
} catch (err)  {
    console.error(`${optionName}: ${version}`, err);
}

async function anime(token, target) {
    new Sequence()
        .effect()
        .file("jb2a.misty_step.02.blue")       
        .atLocation(target)
		.scaleToObject(1)
		.play();
}
