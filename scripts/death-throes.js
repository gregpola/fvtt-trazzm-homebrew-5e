/*
	On their death, dark folk return to the endless flowing darkness from whence they came. Their form appears when evil-hearted determination coalesces from the cold, black depths of nihilism, and their demise shatters the bonds that held this negative energy together.

	When the dark folk dies, it explodes into a flash of blinding darkness in a 20- foot radius. The darkness lingers for 1 minute.
*/
const version = "10.0.1";
const optionName = "Death Throes";

try {
	if (args[0].macroPass === "postActiveEffects") {
		// get the template
		const lastArg = args[args.length - 1];
		const actorToken = canvas.tokens.get(lastArg.tokenId);
		
		let templateDoc = canvas.scene.collections.templates.get(lastArg.templateId);
		if (templateDoc) {
			// add the walls to block vision
			let radius = canvas.grid.size * (templateDoc.distance / canvas.grid.grid.options.dimensions.distance);
			await circleWall(templateDoc.x, templateDoc.y, radius);
			
			// delete the template
			await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [templateDoc.id]);
		}
	}	
	else if (args[0] === "off") {
		async function removeWalls() {
			let darkWalls = canvas.walls.placeables.filter(w => w.document.flags["midi-srd"]?.DeathThroes?.ActorId === actor.id)
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
			flags: { "midi-srd": { DeathThroes: { ActorId: actor.id } } }
		});
	}
	await canvas.scene.createEmbeddedDocuments("Wall", data)
}
