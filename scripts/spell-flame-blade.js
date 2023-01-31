/*
	You evoke a fiery blade in your free hand. The blade is similar in size and shape to a Scimitar, and it lasts for the Duration. If you let go of the blade, it disappears, but you can evoke the blade again as a Bonus Action.

	You can use your action to make a melee spell Attack with the fiery blade. On a hit, the target takes 3d6 fire damage.

	The flaming blade sheds bright light in a 10-foot radius and dim light for an additional 10 feet.

	At Higher Levels. When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6 for every two slot levels above 2nd.
*/
const version = "10.0.0";
const optionName = "Flame Blade";
const lastArg = args[args.length - 1];
let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
let actorToken = canvas.tokens.get(lastArg.tokenId);
// modules/jb2a_patreon/Library/2nd_Level/Spiritual_Weapon/SpiritualWeapon_Sword01_01_Flaming_Yellow_Thumb.webp
try {
	
	if (args[0] === "on") {
		const level = Number(args[1]);
		const damageDice = 3 + (Math.floor(level / 2) - 1);
		let item = actor.items.get(lastArg.origin.substring(lastArg.origin.lastIndexOf(".")+1));
		
		let itemData = [{
			"name": optionName,
			"type": "weapon",
			"img": 'icons/skills/melee/strike-blade-hooked-orange-blue.webp',
			"system": {
				"description": {
					"value": "<p>A fiery blade similar to a scimitar</p>",
					"chat": "",
					"unidentified": ""
				},
				"quantity": 1,
				"weight": 1,
				"equipped": true,
				"identified": true,
				"activation": {
					"type": "action",
					"cost": 1,
					"condition": ""
				},
				"range": {
					"value": 5,
					"long": null,
					"units": "ft"
				},
				"uses": {
					"value": null,
					"max": "",
					"per": ""
				},
				"actionType": "msak",
				"damage": {
					"parts": [
						[
							`${damageDice}d6`,
							"fire"
						]
					],
					"versatile": ""
				},
				"weaponType": "simpleM",
				"properties": {
					"fin": true,
					"lgt": true,
					"mgc": true
				},
				"proficient": true
			}
		}];
		await actor.createEmbeddedDocuments("Item", itemData);
		
		// set the token lighting
		// TODO get and stash the current data
		actorToken.document.update({
			"light.dim": 20, 
			"light.bright": 10, 
			"light.angle": 360, 
			"light.alpha": 0.5,
			"light.color": "#8a4715",			
			"light.animation": {
				"type": "flame",
				"speed": 2,
				"intensity": 2
			}			
		});
		
	}
	else if (args[0] === "off") {
		let itemz = actor.items.find(i => i.name === optionName && i.type === "weapon");
		if (itemz) {
			await actor.deleteEmbeddedDocuments('Item', [itemz.id]);
			ChatMessage.create({
				content: `${actorToken.name}'s ${optionName} disappears.`,
				speaker: ChatMessage.getSpeaker({ actor: actor })});
		}
		
		// TODO reset the token lighting
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
