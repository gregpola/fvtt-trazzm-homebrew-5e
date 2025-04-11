/*
	The ground in a 20-foot radius centered on a point within range twists and sprouts hard spikes and thorns. The area
	becomes difficult terrain for the Duration. When a creature moves into or within the area, it takes 2d4 piercing
	damage for every 5 feet it travels.

	The transformation of the ground is camouflaged to look natural. Any creature that can’t see the area at the time
	the spell is cast must make a Wisdom (Perception) check against your spell save DC to recognize the terrain as
	hazardous before entering it.

	The ground in a 20-foot-radius Sphere centered on a point within range sprouts hard spikes and thorns. The area
	becomes Difficult Terrain for the duration. When a creature moves into or within the area, it takes 2d4 Piercing
	damage for every 5 feet it travels.

	The transformation of the ground is camouflaged to look natural. Any creature that can’t see the area when the spell
	is cast must take a Search action and succeed on a Wisdom (Perception) or Wisdom (Survival) check against your spell
	save DC to recognize the terrain as hazardous before entering it.
*/
const version = "12.4.0";
const optionName = "Spike Growth";

// Move within
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

console.log("Spike Growth -- " + event.user.name);
if (!event.data.teleport) {
	const startPoint = {x: event.data.segments[0].from.x, y: event.data.segments[0].from.y};
	const endPoint = {x: event.data.segments[0].to.x, y: event.data.segments[0].to.y};
	const distanceMoved = canvas.grid.measureDistance(startPoint, endPoint, {gridSpaces: true});
	const squaresMoved = distanceMoved / 5;

	if (squaresMoved > 0) {
		const sourceToken = event.data.token;
		const sourceActor = event.data.token.actor;
		const diceCount = squaresMoved * 2;
		const itemUuid = region.getFlag('region-attacher', 'itemUuid');
		const sourceItem = await fromUuid(itemUuid);
		const damageRoll = await new CONFIG.Dice.DamageRoll(`${diceCount}d4`, {}, {type: 'piercing'}).evaluate();
		await new MidiQOL.DamageOnlyWorkflow(sourceActor, sourceToken, null, null, [sourceToken], damageRoll, {flavor: 'Pierced by spikes', itemCardId: "new", itemData: sourceItem?.toObject()});
		await new Sequence().effect().file("jb2a.swirling_leaves.loop.01.green").atLocation(sourceToken).scaleToObject(1.5).play();
	}
}
