/*
	You create a wall of tough, pliable, tangled brush bristling with needle-sharp thorns. The wall appears within range on a solid surface and lasts for the duration. You choose to make the wall up to 60 feet long, 10 feet high, and 5 feet thick or a circle that has a 20-foot diameter and is up to 20 feet high and 5 feet thick. The wall blocks line of sight.

	When the wall appears, each creature within its area must make a Dexterity saving throw. On a failed save, a creature takes 7d8 piercing damage, or half as much damage on a successful save.

	A creature can move through the wall, albeit slowly and painfully. For every 1 foot a creature moves through the wall, it must spend 4 feet of movement. Furthermore, the first time a creature enters the wall on a turn or ends its turn there, the creature must make a Dexterity saving throw. It takes 7d8 slashing damage on a failed save, or half as much damage on a successful one.

	At Higher Levels. When you cast this spell using a spell slot of 7th level or higher, both types of damage increase by 1d8 for each slot level above 6th.
*/
const version = "10.0.0"
const optionName = "Wall of Thorns";
const templateFlag = "wall-of-thorns-template";

try {
	const lastArg = args[args.length - 1];

	if (args[0].macroPass === "postActiveEffects") {
		// build the template macro
		let templateDoc = canvas.scene.collections.templates.get(lastArg.templateId);
		if (!templateDoc) return;

		// add the walls to block vision
		await lineWall(templateDoc);

		// store the spell data in the template
		let spellLevel = lastArg.spellLevel;
		let spelldc = lastArg.actor.system.attributes.spelldc;
		let touchedTokens = await game.modules.get('templatemacro').api.findContained(templateDoc);
		await templateDoc.setFlag('world', 'spell.WallofThorns', {spellLevel, spelldc, touchedTokens});
		await HomebrewMacros.wallOfThornsEffects(touchedTokens);
	}
	else if (args[0] === "off") {
		async function removeWalls() {
			let thornWalls = canvas.walls.placeables.filter(w => w.document.flags["midi-srd"]?.WallofThorns?.ActorId === actor.id)
			let wallArray = thornWalls.map(function (w) {
				return w.document._id;
			})
			await canvas.scene.deleteEmbeddedDocuments("Wall", wallArray);
		}
		await removeWalls();
	}

} catch (err) {
    console.error(`${optionName} - ${version}`, err);
}

async function lineWall(templateDoc) {
	const ray = Ray.fromAngle(templateDoc.x, 
		templateDoc.y, 
		templateDoc.direction * (Math.PI/180), 
		templateDoc.distance * canvas.grid.size / canvas.dimensions.distance);

	let data = [];
	data.push({
		c: [ray.A.x, ray.A.y, ray.B.x, ray.B.y],
		move: CONST.WALL_MOVEMENT_TYPES.NONE,
		sense: CONST.WALL_SENSE_TYPES.NORMAL,
		dir: CONST.WALL_DIRECTIONS.BOTH,
		door: CONST.WALL_DOOR_TYPES.NONE,
		ds: CONST.WALL_DOOR_STATES.CLOSED,
		flags: { "midi-srd": { WallofThorns: { ActorId: actor.id } } }
	});
	await canvas.scene.createEmbeddedDocuments("Wall", data);
}
