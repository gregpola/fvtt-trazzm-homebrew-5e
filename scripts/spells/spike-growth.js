/*
	The ground in a 20-foot radius centered on a point within range twists and sprouts hard spikes and thorns. The area
	becomes difficult terrain for the Duration. When a creature moves into or within the area, it takes 2d4 piercing
	damage for every 5 feet it travels.

	The transformation of the ground is camouflaged to look natural. Any creature that can’t see the area at the time
	the spell is cast must make a Wisdom (Perception) check against your spell save DC to recognize the terrain as
	hazardous before entering it.
*/
const version = "12.3.0";
const optionName = "Spike Growth";

// Move Into
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let effect = event.data.token?.actor?.effects?.find(eff => eff.name === 'In Spike Growth');
if (!effect) {
	let effectData = {
		'name': 'In Spike Growth',
		'icon': 'icons/magic/nature/vines-thorned-curled-glow-green.webp',
		'changes': [
			{
				'key': 'system.attributes.movement.walk',
				'mode': CONST.ACTIVE_EFFECT_MODES.MULTIPLY,
				'value': '0.5',
				'priority': 20
			}
		],
		'origin': origin,
	};

	await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: event.data.token.actor.uuid, effects: [effectData]});
}

// TODO apply first 5 feet of damage? -- handled sort of when they move out

// Move Out
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let effect = event.data.token?.actor?.effects?.find(eff => eff.name === 'In Spike Growth');
if (effect) {
	await MidiQOL.socket().executeAsGM("removeEffects", {actorUuid: event.data.token.actor.uuid, effects: [effect.id]});
}


// Move within
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const startPoint = {x: event.data.segments[0].from.x, y: event.data.segments[0].from.y};
const endPoint = {x: event.data.segments[0].to.x, y: event.data.segments[0].to.y};
const distanceMoved = canvas.grid.measureDistance(startPoint, endPoint, {gridSpaces: true});
const squaresMoved = distanceMoved / 5;
if (squaresMoved > 0) {
	for (let i = 0; i < squaresMoved; i++) {
		let diceRoll = await new Roll('2d4').roll();
		let diceTotal = diceRoll.total;
		diceRoll.toMessage({
			rollMode: 'roll',
			speaker: {alias: name},
			flavor: 'Spike Growth Damage'
		});

		await MidiQOL.applyTokenDamage(
			[
				{
					damage: diceTotal,
					type: 'piercing'
				}
			],
			diceTotal,
			new Set([event.data.token]),
			null,
			null
		);
	}
}
