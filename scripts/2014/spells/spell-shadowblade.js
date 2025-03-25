/*
	You weave together threads of shadow to create a sword of solidified gloom in your hand. This magic sword lasts until
	the spell ends. It counts as a simple melee weapon with which you are proficient. It deals 2d8 psychic damage on a
	hit and has the finesse, light, and thrown properties (range 20/60). In addition, when you use the sword to attack a
	target that is in dim light or darkness, you make the attack roll with advantage.

	If you drop the weapon or throw it, it dissipates at the end of the turn. Thereafter, while the spell persists, you
	can use a bonus action to cause the sword to reappear in your hand.

	At Higher Levels. When you cast this spell using a 3rd- or 4th-level spell slot, the damage increases to 3d8. When
	you cast it using a 5th- or 6th-level spell slot, the damage increases to 4d8. When you cast it using a spell slot
	of 7th level or higher, the damage increases to 5d8.
*/
const version = "10.0.0";
const optionName = "Shadow Blade";
const lastArg = args[args.length - 1];
let actor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
let actorToken = canvas.tokens.get(lastArg.tokenId);

try {
	
	if (args[0] === "on") {
		const level = Number(args[1]);
		const damageDice = level > 6 ? 5 : (Math.ceil(level / 2) + 1);
		let item = actor.items.get(lastArg.origin.substring(lastArg.origin.lastIndexOf(".")+1));
		
		let itemData = [{
			"name": optionName,
			"type": "weapon",
			"img": 'modules/fvtt-trazzm-homebrew-5e/assets/magic-items/shadow-blade.webp',
			"system": {
				"description": {
					"value": "<p>A magical weapon made of Shadows.</p>",
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
					"value": 20,
					"long": 60,
					"units": "ft"
				},
				"uses": {
					"value": null,
					"max": "",
					"per": ""
				},
				"actionType": "mwak",
				"damage": {
					"parts": [
						[
							`${damageDice}d8 + @mod`,
							"psychic"
						]
					],
					"versatile": ""
				},
				"weaponType": "simpleM",
				"properties": {
					"fin": true,
					"lgt": true,
					"mgc": true,
					"thr": true
				},
				"proficient": true
			}
		}];
		await actor.createEmbeddedDocuments("Item", itemData);
		
	}
	else if (args[0] === "off") {
		let itemz = actor.items.find(i => i.name === optionName && i.type === "weapon");
		if (itemz) {
			await actor.deleteEmbeddedDocuments('Item', [itemz.id]);
			ChatMessage.create({
				content: `${actorToken.name}'s ${optionName} dissipates.`,
				speaker: ChatMessage.getSpeaker({ actor: actor })});
		}
	}

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
