/*
	You create a 20-foot-radius sphere of fog centered on a point within range. The sphere spreads around corners, and
	its area is heavily obscured. It lasts for the duration or until a wind of moderate or greater speed (at least 10
	miles per hour) disperses it.

	At Higher Levels. When you cast this spell using a spell slot of 2nd level or higher, the radius of the fog
	increases by 20 feet for each slot level above 1st.
*/
const version = "12.3.0";
const optionName = "Stinking Cloud";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const templateFLag = "stinking-cloud-template-uuid";

const TEMPLATE_DARK_LIGHT = {
	"negative": true,
	"priority": 0,
	"alpha": 0.25,
	"angle": 360,
	"bright": 20,
	"color": '#aba6a6',
	"coloration": 1,
	"dim": 0,
	"attenuation": 0.5,
	"luminosity": 0.5,
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
				const dc = actor.system.attributes.spelldc ?? 12;
				await template.setFlag(_flagGroup, templateFLag, {saveDC: dc});

				const config = TEMPLATE_DARK_LIGHT;
				config.radius = flag.radius;

				const lightTemplate = {
					x: flag.x,
					y: flag.y,
					rotation: 0,
					walls: true,
					vision: false,
					config,
					hidden: false,
					flags: {
						spellEffects: {
							StinkingCloud: {
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
			}
		}
	}
	else if (args[0] === "off") {
		const darkLights = canvas.lighting.placeables.filter((w) => w.document.flags?.spellEffects?.StinkingCloud?.ActorId === actor.uuid);
		const lightArray = darkLights.map((w) => w.id);

		if (lightArray.length > 0) {
			await canvas.scene.deleteEmbeddedDocuments("AmbientLight", lightArray);
		}

		let flag = actor.getFlag(_flagGroup, templateFLag);
		if (flag) {
			const template = await fromUuidSync(flag.templateUuid);
			if (template) {
				await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [template.id]);
			}

			await actor.unsetFlag(_flagGroup, templateFLag);
		}
	}

} catch (err) {
	console.error(`${optionName} : ${version}`, err);
}
