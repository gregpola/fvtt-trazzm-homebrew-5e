/*
    You create a 20-foot-radius Sphere of yellow-green fog centered on a point within range. The fog lasts for the
    duration or until strong wind (such as the one created by Gust of Wind) disperses it, ending the spell. Its area is
    Heavily Obscured.

    Each creature in the Sphere makes a Constitution saving throw, taking 5d8 Poison damage on a failed save or half as
    much damage on a successful one. A creature must also make this save when the Sphere moves into its space and when
    it enters the Sphere or ends its turn there. A creature makes this save only once per turn.

    The Sphere moves 10 feet away from you at the start of each of your turns.
 */
const version = "12.5.0";
const optionName = "Cloudkill";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const templateFLag = "cloudkill-template-uuid";

const TEMPLATE_DARK_LIGHT = {
    "negative": true,
    "priority": 0,
    "alpha": 0.1,
    "angle": 360,
    "bright": 19,
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
            await template.update({
                fillColor: 0,
                fillAlpha: 0,
                alpha: 0,
                opacity: 0.1
            });

            await actor.setFlag(_flagGroup, templateFLag, {templateUuid: template.uuid});
            await drawAmbientLight(template, actor);
        });

        Hooks.once("createRegion", async (region) => {
            await region.update({
                visibility: 0,
                flags: {
                    spellEffects: {
                        sourceItemUuid: item.uuid
                    }
                }
            });
        });

        const hookId = Hooks.on("deleteMeasuredTemplate", async (template) => {
            if (template) {
                const origin = fromUuidSync(template.flags.dnd5e.origin);
                if (origin && (origin.actor === actor) && (origin.item.name === optionName)) {
                    await game.trazzm.socket.executeAsGM("removeAmbientLight", 'Cloudkill', actor);
                    Hooks.off("deleteMeasuredTemplate", hookId);
                }
            }
        });
    }
    else if (args[0] === "each") {
        // move the cloud
        let flag = actor.getFlag(_flagGroup, templateFLag);
        if (flag) {
            const template = await fromUuidSync(flag.templateUuid);
            if (template) {
                let newCenter = getAllowedMoveLocation(token, template, 2);
                if (!newCenter) {
                    return ui.notifications.error(`${optionName} - no room to move the template`);

                } else {
                    newCenter = canvas.grid.getSnappedPoint(newCenter, {mode: CONST.GRID_SNAPPING_MODES.TOP_LEFT_CORNER});
                    await template.update({x: newCenter.x, y: newCenter.y});
                    await game.trazzm.socket.executeAsGM("updateTemplate", template.uuid, {x: newCenter.x, y: newCenter.y});

                    const lightArray = getAmbientLight(actor);
                    for (let lightTemplate of lightArray) {
                        let doc = canvas.scene.getEmbeddedDocument("AmbientLight", lightTemplate);
                        if (doc) {
                            await doc.update({x: newCenter.x, y: newCenter.y});
                        }
                    }
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function drawAmbientLight(template, actor) {
    const config = TEMPLATE_DARK_LIGHT;
    config.bright = template.distance - 2;

    const lightTemplate = {
        x: template.x,
        y: template.y,
        rotation: 0,
        walls: false,
        vision: false,
        config,
        hidden: false,
        flags: {
            spellEffects: {
                Cloudkill: {
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

    await game.trazzm.socket.executeAsGM("drawAmbientLight", lightTemplate);
}

function getAllowedMoveLocation(casterToken, template, maxSquares) {
    for (let i = maxSquares; i > 0; i--) {
        let movePixels = i * canvas.grid.size;
        let ray = new Ray(casterToken.center, template.object.center);
        let newCenter = ray.project((ray.distance + movePixels)/ray.distance);

        const testCollision = CONFIG.Canvas.polygonBackends.move.testCollision(template.object.center, newCenter, { type: "move", mode: "any" });
        if (!testCollision) return newCenter;
    }

    return false;
}

function getAmbientLight(actor) {
    const darkLights = canvas.lighting.placeables.filter((w) => w.document.flags?.spellEffects?.Cloudkill?.ActorId === actor.uuid);
    return darkLights.map((w) => w.id);
}
