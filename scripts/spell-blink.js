/*
	Roll a d20 at the end of each of your turns for the duration of the spell. On a roll of 11 or higher, you vanish from your current plane of existence and appear in the Ethereal Plane (the spell fails and the casting is wasted if you were already on that plane). At the start of your next turn, and when the spell ends if you are on the Ethereal Plane, you return to an unoccupied space of your choice that you can see within 10 feet of the space you vanished from. If no unoccupied space is available within that range, you appear in the nearest unoccupied space (chosen at random if more than one space is equally near). You can dismiss this spell as an action.

	While on the Ethereal Plane, you can see and hear the plane you originated from, which is cast in shades of gray, and you can't see anything there more than 60 feet away. You can only affect and be affected by other creatures on the Ethereal Plane. Creatures that aren't there can't perceive you or interact with you, unless they have the ability to do so.
*/
const version = "10.0.0";
const optionName = "Blink";

// On Combat Turn Starting
console.error("Combat turn starting");
let position = await HomebrewMacros.warpgateCrosshairs(token, 10, origin);
if (position) {
	// check for token collision
	const newCenter = canvas.grid.getSnappedPosition(position.x, position.y, 1);
	if (!HomebrewMacros.checkPosition(newCenter.x, newCenter.y)) {
		const portalScale = token.w / canvas.grid.size * 0.7;		
		new Sequence()
			.effect()
			.file("jb2a.misty_step.01.dark_black")       
			.atLocation(token)
			.scale(portalScale)
			.fadeOut(200)
			.wait(500)
			.thenDo(() => {
				canvas.pan(position)
			})
			.animation()
			.on(token)
			.teleportTo(position, { relativeToCenter: true })
			.fadeIn(200)
			.play();
	}
}


// On Combat Turn Starting
let blinkRoll = await new Roll('1d20').roll({async: true});
blinkRoll.toMessage({
    rollMode: 'roll',
    speaker: {alias: name},
    flavor: 'Blink'
});
if (blinkRoll.total < 11) return;

let blinkEffect = actor.effects?.find(i=>i.label === 'Blink');
let originUuid;
if (blinkEffect) originUuid = blinkEffect.origin;
let effectData = {
	'label': 'Blinked Away',
	'icon': 'icons/magic/air/wind-stream-purple.webp',
	'duration': {
		'rounds': 1
	},
	'origin': originUuid,
	'changes': [
		{
			'key': 'flags.midi-qol.superSaver.all',
			'value': '1',
			'mode': 5,
			'priority': 20
		},
		{
			'key': 'system.attributes.ac.bonus',
			'value': '100',
			'mode': 5,
			'priority': 20
		},
		{
			'key': 'flags.midi-qol.min.ability.save.all',
			'value': '100',
			'mode': 5,
			'priority': 20
		},
		{
			'key': 'flags.midi-qol.fail.critical.all',
			'value': '1',
			'mode': 5,
			'priority': 20
		},
		{
			'key': 'macro.tokenMagic',
			'value': 'spectral-body',
			'mode': 0,
			'priority': 20
		}
	],
	'flags': {
		'dae': {
			'specialDuration': ['turnStart']
		}
	}
};
await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effectData] });
