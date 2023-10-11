/*
	You create a wall of fire on a solid surface within range. You can make the wall up to 60 feet long, 20 feet high,
	and 1 foot thick, or a ringed wall up to 20 feet in diameter, 20 feet high, and 1 foot thick. The wall is opaque and
	lasts for the duration.

	When the wall appears, each creature within its area must make a Dexterity saving throw. On a failed save, a creature
	takes 5d8 fire damage, or half as much damage on a successful save.

	One side of the wall, selected by you when you cast this spell, deals 5d8 fire damage to each creature that ends its
	turn within 10 feet of that side or inside the wall. A creature takes the same damage when it enters the wall for the
	first time on a turn or ends its turn there. The other side of the wall deals no damage.

	At Higher Levels. When you cast this spell using a spell slot of 5th level or higher, the damage increases by 1d8
	for each slot level above 4th.
*/
const version = "11.0";
const optionName = "Wall of Fire";
const templateFlag = "wall-of-fire-template";

try {
	if (args[0].macroPass === "templatePlaced") {
		// get the template
		let templateDoc = canvas.scene.collections.templates.get(workflow.templateId);
		if (templateDoc) {
			// add the walls to block vision
			await lineWall(templateDoc);

			// store the spell data in the template
			let spellLevel = args[0].spellLevel;
			let spelldc = actor.system.attributes.spelldc;
			let touchedTokens = await game.modules.get('templatemacro').api.findContained(templateDoc);
			await templateDoc.setFlag('world', 'spell.WallofFire', {spellLevel, spelldc, touchedTokens});
			await HomebrewMacros.wallOfFireEffects(touchedTokens);
		}
	}
	else if (args[0] === "off") {
		async function removeWalls() {
			let thornWalls = canvas.walls.placeables.filter(w => w.document.flags["midi-srd"]?.WallofFire?.ActorId === actor.id)
			let wallArray = thornWalls.map(function (w) {
				return w.document._id;
			})
			await canvas.scene.deleteEmbeddedDocuments("Wall", wallArray);
		}
		await removeWalls();
	}
	
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
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
		flags: { "midi-srd": { WallofFire: { ActorId: actor.id } } }
	});
	await canvas.scene.createEmbeddedDocuments("Wall", data);
}
