const version = "10..0";
const optionName = "Darkness";

try {
	
	if (args[0] === "on") {
		let templateData = {
			t: "circle",
			user: game.user.id,
			distance: 15,
			direction: 0,
			x: 0,
			y: 0,
			fillColor: game.user.color,
			flags: { "midi-srd": { Darkness: { ActorId: actor.id } } }
		};

		Hooks.once("createMeasuredTemplate", async (template) => {
			let radius = canvas.grid.size * (template.distance / canvas.grid.grid.options.dimensions.distance);
			await circleWall(template.x, template.y, radius);
			if (game.modules.get("perfect-vision")?.active)
				await darknessLight(template.x, template.y, radius);
			await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [template.id]);
		});
		templateCreation(templateData, actor);
	}

	if (args[0] === "off") {
		async function removeWalls() {
			let darkWalls = canvas.walls.placeables.filter(w => w.document.flags["midi-srd"]?.Darkness?.ActorId === actor.id)
			let wallArray = darkWalls.map(function (w) {
				return w.document._id;
			})
			await canvas.scene.deleteEmbeddedDocuments("Wall", wallArray);
		}
		removeWalls();
		
		if (game.modules.get("perfect-vision")?.active) {
			const darkLights = canvas.lighting.placeables.filter((w) => w.document.flags?.spellEffects?.Darkness?.ActorId === darknessParams.targetActorId);
			const lightArray = darkLights.map((w) => w.id);
			await canvas.scene.deleteEmbeddedDocuments("AmbientLight", lightArray);
		}			
	}

} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}

async function circleWall(cx, cy, radius) {
	let data = [];
	const step = 30;
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

async function darknessLight(cx, cy, radius) {
  const lightTemplate = {
    x: cx,
    y: cy,
    rotation: 0,
    walls: false,
    vision: false,
    config: {
      alpha: 0.5,
      angle: 0,
      bright: radius,
      coloration: 1,
      dim: 0,
      gradual: false,
      luminosity: -1,
      saturation: 0,
      contrast: 0,
      shadows: 0,
      animation: {
        speed: 5,
        intensity: 5,
        reverse: false,
      },
      darkness: {
        min: 0,
        max: 1,
      },
      color: null,
    },
    hidden: false,
    flags: {
      spellEffects: {
        Darkness: {
          ActorId: actor.id,
        },
      },
      "perfect-vision": {
        sightLimit: 0,
      },
    },
  };
  await canvas.scene.createEmbeddedDocuments("AmbientLight", [lightTemplate]);
}

function templateCreation(templateData, actor) {
	let doc = new CONFIG.MeasuredTemplate.documentClass(templateData, { parent: canvas.scene });
	let template = new game.dnd5e.canvas.AbilityTemplate(doc);
	template.actorSheet = actor.sheet;
	template.drawPreview();
}
