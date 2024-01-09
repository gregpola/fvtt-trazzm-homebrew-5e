/*
	Magical darkness spreads from a point you choose within range to fill a 15-foot-radius sphere for the duration. The
	darkness spreads around corners. A creature with darkvision can't see through this darkness, and nonmagical light
	can't illuminate it.

	If the point you choose is on an object you are holding or one that isn't being worn or carried, the darkness
	emanates from the object and moves with it. Completely covering the source of the darkness with an opaque object,
	such as a bowl or a helm, blocks the darkness.

	If any of this spell's area overlaps with an area of light created by a spell of 2nd level or lower, the spell that
	created the light is dispelled.
*/
const version = "11.1";
const optionName = "Darkness";

try {
	if (args[0].macroPass === "templatePlaced") {
		// get the template
		let templateDoc = canvas.scene.collections.templates.get(workflow.templateId);
		if (templateDoc) {
			// add the walls to block vision
			let radius = canvas.grid.size * (templateDoc.distance / canvas.grid.grid.options.dimensions.distance);
			await circleWall(templateDoc.x, templateDoc.y, radius);
		}
	}
	else if (args[0] === "off") {
		async function removeWalls() {
			let darkWalls = canvas.walls.placeables.filter(w => w.document.flags["midi-srd"]?.Darkness?.ActorId === actor.id)
			let wallArray = darkWalls.map(function (w) {
				return w.document._id;
			})
			await canvas.scene.deleteEmbeddedDocuments("Wall", wallArray);
		}
		await removeWalls();
	}

} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}

async function circleWall(cx, cy, radius) {
	let data = [];
	const step = 15;
	for (let i = step; i <= 360; i += step) {
		let theta0 = Math.toRadians(i - step);
		let theta1 = Math.toRadians(i);

		let lastX = Math.floor(radius * Math.cos(theta0) + cx);
		let lastY = Math.floor(radius * Math.sin(theta0) + cy);
		let newX = Math.floor(radius * Math.cos(theta1) + cx);
		let newY = Math.floor(radius * Math.sin(theta1) + cy);

		data.push({
			c: [lastX, lastY, newX, newY],
			move: CONST.WALL_MOVEMENT_TYPES.NONE,
			sense: CONST.WALL_SENSE_TYPES.NORMAL,
			dir: CONST.WALL_DIRECTIONS.BOTH,
			door: CONST.WALL_DOOR_TYPES.NONE,
			ds: CONST.WALL_DOOR_STATES.CLOSED,
			flags: { "midi-srd": { Darkness: { ActorId: actor.id } } }
		});
	}

	await canvas.scene.createEmbeddedDocuments("Wall", data)
}
