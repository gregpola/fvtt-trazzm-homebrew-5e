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
const version = "12.3.0";
const optionName = "Darkness";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const templateFLag = "darkness-template-uuid";

const TEMPLATE_DARK_LIGHT = {
	"negative": true,
	"priority": 0,
	"alpha": 0.1,
	"angle": 360,
	"bright": 15,
	"color": null,
	"coloration": 1,
	"dim": 0,
	"attenuation": 0.75,
	"luminosity": 0.75,
	"saturation": 0,
	"contrast": 0,
	"shadows": 0,
	"animation": {
		"type": null,
		"speed": 5,
		"intensity": 5,
		"reverse": false
	},
	"darkness": {
		"min": 0,
		"max": 1
	}
};

try {
	if (args[0].macroPass === "preItemRoll") {
		Hooks.once("createMeasuredTemplate", async (template) => {
			let radius = canvas.grid.size * (template.distance / canvas.grid.distance);
			await actor.setFlag(_flagGroup, templateFLag, {templateUuid: template.uuid, radius: radius, x: template.x, y: template.y});
		});
	}
	else if (args[0] === "on") {
		let flag = actor.getFlag(_flagGroup, templateFLag);
		if (flag) {
			const template = await fromUuidSync(flag.templateUuid);
			if (template) {
				const config = TEMPLATE_DARK_LIGHT;
				config.radius = flag.radius;

				const lightTemplate = {
					x: flag.x,
					y: flag.y,
					rotation: 0,
					walls: false,
					vision: false,
					config,
					hidden: false,
					flags: {
						spellEffects: {
							Darkness: {
								ActorId: actor.uuid,
							},
						},
						"perfect-vision": {
							resolution: 1,
							visionLimitation: {
								enabled: true,
								sight: 0,
								detection: {
									feelTremor: null,
									seeAll: null,
									seeInvisibility: 0,
									senseAll: null,
									senseInvisibility: null,
								},
							},
						},
					},
				};
				await canvas.scene.createEmbeddedDocuments("AmbientLight", [lightTemplate]);
				await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [template.id]);
			}
		}
	}
	else if (args[0] === "off") {
		const darkLights = canvas.lighting.placeables.filter((w) => w.document.flags?.spellEffects?.Darkness?.ActorId === actor.uuid);
		const lightArray = darkLights.map((w) => w.id);

		if (lightArray.length > 0) {
			await canvas.scene.deleteEmbeddedDocuments("AmbientLight", lightArray);
		}

		let flag = actor.getFlag(_flagGroup, templateFLag);
		if (flag) {
			await actor.unsetFlag(_flagGroup, templateFLag);
		}
	}

} catch (err) {
	console.error(`${optionName} : ${version}`, err);
}
