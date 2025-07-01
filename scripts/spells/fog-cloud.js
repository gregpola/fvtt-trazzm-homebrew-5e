/*
    You create a 20-foot-radius Sphere of fog centered on a point within range. The Sphere is Heavily Obscured. It lasts
    for the duration or until a strong wind (such as one created by Gust of Wind) disperses it.

    Using a Higher-Level Spell Slot. The fog’s radius increases by 20 feet for each spell slot level above 1.
*/
const version = "12.4.1";
const optionName = "Fog Cloud";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const templateFLag = "fog-cloud-template-uuid";

const TEMPLATE_DARK_LIGHT = {
    "negative": true,
    "priority": 0,
    "alpha": 0.1,
    "angle": 360,
    "bright": 16,
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
                            FogCloud: {
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
    console.error(`${optionName}: ${version}`, err);
}

function getAmbientLight(actor) {
    const darkLights = canvas.lighting.placeables.filter((w) => w.document.flags?.spellEffects?.FogCloud?.ActorId === actor.uuid);
    const lightArray = darkLights.map((w) => w.id);
    return lightArray;
}
