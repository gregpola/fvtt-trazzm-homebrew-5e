/*
    Until the spell ends, sleet falls in a 40-foot-tall, 20-foot-radius Cylinder centered on a point you choose within
    range. The area is Heavily Obscured, and exposed flames in the area are doused.

    Ground in the Cylinder is Difficult Terrain. When a creature enters the Cylinder for the first time on a turn or
    starts its turn there, it must succeed on a Dexterity saving throw or have the Prone condition and lose Concentration.
*/
const optionName = "Sleet Storm";
const version = "12.4.0";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const templateFLag = "sleet-storm-template-uuid";

try {
    if (args[0].macroPass === "preItemRoll") {
        Hooks.once("createMeasuredTemplate", async (template) => {
            // look for visibility and region
            await template.update({
                fillColor: 0,
                fillAlpha: 0,
                alpha: 0,
                opacity: 0.1
            });
            let radius = canvas.grid.size * (template.distance / canvas.grid.distance);
            await actor.setFlag(_flagGroup, templateFLag, {templateUuid: template.uuid, radius: radius, x: template.x, y: template.y});
        });
    }
    else if (args[0] === "on") {
        let flag = actor.getFlag(_flagGroup, templateFLag);
        if (flag) {
            const template = await fromUuidSync(flag.templateUuid);
            if (template) {
                const effectRadius = flag.radius * canvas.grid.distance / canvas.grid.size;

                const config = {
                    "negative": true,
                    "priority": 0,
                    "alpha": 0.1,
                    "angle": 360,
                    "bright": effectRadius - 2,
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
                            SleetStorm: {
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
        const lightArray = getAmbientLight(actor);
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

function getAmbientLight(actor) {
    const darkLights = canvas.lighting.placeables.filter((w) => w.document.flags?.spellEffects?.SleetStorm?.ActorId === actor.uuid);
    const lightArray = darkLights.map((w) => w.id);
    return lightArray;
}
