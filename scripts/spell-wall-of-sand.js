/*
	You conjure up a wall of swirling sand on the ground at a point you can see within range. You can make the wall up to 30 feet long, 10 feet high, and 10 feet thick, and it vanishes when the spell ends. It blocks line of sight but not movement. A creature is Blinded while in the wall’s space and must spend 3 feet of movement for every 1 foot it moves there.
*/
const version = "11.0";
const optionName = "Wall of Sand";
const templateFlag = "wall-of-sand-template";

try {
	if (args[0].macroPass === "templatePlaced") {
		// get the template
		let templateDoc = canvas.scene.collections.templates.get(workflow.templateId);
		if (templateDoc) {
			// add the walls to block vision
			await lineWall(templateDoc);

			// store the spell data in the template
			let touchedTokens = await game.modules.get('templatemacro').api.findContained(templateDoc);
			await templateDoc.setFlag('world', 'spell.WallofSand', {touchedTokens});

			// apply blinded to the tokens
			for (let token of touchedTokens) {
				let tokenDoc = canvas.scene.tokens.get(token);
				await game.dfreds?.effectInterface.addEffect(
					{ effectName: 'Blinded', uuid: tokenDoc.actor.uuid, origin: workflow.templateId });
			}
		}
	}
	else if (args[0] === "off") {
		async function removeWalls() {
			let theWalls = canvas.walls.placeables.filter(w => w.document.flags["midi-srd"]?.WallofSand?.ActorId === actor.id)
			let wallArray = theWalls.map(function (w) {
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
		flags: { "midi-srd": { WallofSand: { ActorId: actor.id } } }
	});
	await canvas.scene.createEmbeddedDocuments("Wall", data);
}
