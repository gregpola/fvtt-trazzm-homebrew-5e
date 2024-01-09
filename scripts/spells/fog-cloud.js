/*
	You create a 20-foot-radius sphere of fog centered on a point within range. The sphere spreads around corners, and
	its area is heavily obscured. It lasts for the duration or until a wind of moderate or greater speed (at least 10
	miles per hour) disperses it.

	At Higher Levels. When you cast this spell using a spell slot of 2nd level or higher, the radius of the fog
	increases by 20 feet for each slot level above 1st.
*/
const version = "11.1";
const optionName = "Fog Cloud";

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
			let darkWalls = canvas.walls.placeables.filter(w => w.document.flags["midi-srd"]?.FogCloud?.ActorId === actor.id)
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
			flags: { "midi-srd": { FogCloud: { ActorId: actor.id } } }
		});
	}
	await canvas.scene.createEmbeddedDocuments("Wall", data)
}
