/*
    You create a wall of fire on a solid surface within range. You can make the wall up to 60 feet long, 20 feet high,
    and 1 foot thick, or a ringed wall up to 20 feet in diameter, 20 feet high, and 1 foot thick. The wall is opaque and
    lasts for the duration.
*/
const version = "12.4.0";
const optionName = "Wall of Fire";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const templateFlag = "wall-template-uuid";

const ROUND_DARK_TEMPLATE = {
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
            await actor.setFlag(_flagGroup, templateFlag, {templateUuid: template.uuid});
        });
    }
    else if (args[0] === "on") {
        let flag = actor.getFlag(_flagGroup, templateFlag);
        if (flag) {
            const template = await fromUuidSync(flag.templateUuid);
            if (template) {
                console.log(template);
                if (template.t === 'circle') {
                    const circleRegion = await drawCircleRegion(template);
                    if (circleRegion) {
                        await actor.setFlag(_flagGroup, templateFlag, {templateUuid: template.uuid, templateRegionId: circleRegion.id});
                    }
                }
                else {
                    const lineRegion = await drawLineRegion(template);
                    if (lineRegion) {
                        await actor.setFlag(_flagGroup, templateFlag, {templateUuid: template.uuid, templateRegionId: lineRegion.id});
                    }
                }

                // remove the template because they are ugly
                await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [template.id]);
            }
        }
    }
    else if (args[0] === "off") {
        // remove sight blocking
        const wallLights = canvas.lighting.placeables.filter((w) => w.document.flags?.spellEffects?.WallofFire?.ActorId === actor.uuid);
        const lightArray = wallLights.map((w) => w.id);
        if (lightArray.length > 0) {
            await token.scene.deleteEmbeddedDocuments("AmbientLight", lightArray);
        }

        // delete walls
        async function removeWalls() {
            let walls = token.scene.walls.filter(w => w.flags["fvtt-trazzm-homebrew-5e"]?.WallofFire?.ActorId === actor.id);
            if (walls) {
                let wallArray = walls.map(function (w) {
                    return w._id;
                })

                if (wallArray.length > 0) {
                    await token.scene.deleteEmbeddedDocuments("Wall", wallArray);
                }
            }
        }
        await removeWalls();

        // delete region
        let flags = actor.getFlag(_flagGroup, templateFlag);
        if (flags) {
            if (flags.templateRegionId) {
                await token.scene.deleteEmbeddedDocuments('Region', [flags.templateRegionId]);
            }
            await actor.unsetFlag(_flagGroup, templateFlag);
        }
    }

} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}

async function drawCircleRegion(template) {
    let visibilityRegion = undefined;

    let dndFlags = template.flags.dnd5e;
    const height = dndFlags?.dimensions?.height ?? 20;
    const radius = dndFlags?.dimensions?.size ?? 10;
    const castLevel = dndFlags?.spellLevel ?? 4;
    const elevation = token.document.elevation ?? 0;

    let visionRegionData = {
        name: `${optionName} - Circle Wall`,
        color: game.user.color,
        shapes: [
            {
                type: 'ellipse',
                x: template.x,
                y: template.y,
                radiusX: (template.object.shape.radius / radius) * (radius + 0.5),
                radiusY: (template.object.shape.radius / radius) * (radius + 0.5),
                rotation: 0,
                hole: false
            },
            {
                type: 'ellipse',
                x: template.x,
                y: template.y,
                radiusX: (template.object.shape.radius / radius) * (radius - 0.5),
                radiusY: (template.object.shape.radius / radius) * (radius - 0.5),
                rotation: 0,
                hole: true
            }
        ],
        elevation: {
            bottom: elevation,
            top: elevation + height
        },
        behaviors: [],
        visibility: 0,
        locked: false,
        flags: {
            'fvtt-trazzm-homebrew-5e': {
                castData: {
                    castLevel: castLevel,
                    saveDC: actor.system.attributes.spelldc
                },
                region: {
                    visibility: {
                        obscured: true
                    }
                },
                wallOfFire: {
                    casterUuid: actor.uuid,
                    origin: item.uuid
                }
            }
        }
    };

    let results = await token.scene.createEmbeddedDocuments("Region", [visionRegionData]);
    console.log(results);

    if (results && results.length > 0) {
        visibilityRegion = results[0];
        await drawCircleAnimation(visibilityRegion);
        await drawCircleWall(template);
    }

    return visibilityRegion;
}

async function drawCircleWall(template) {
    const radius = template.distance - .15;

    const config = ROUND_DARK_TEMPLATE;
    config.radius = radius;
    config.bright = radius;

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
                WallofFire: {
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

async function drawCircleAnimation(region) {
    await new Sequence()
        .effect()
        .file('jb2a.wall_of_fire.Ring.yellow')
        .scaleToObject(1.05)
        .attachTo(region, {offset: {x: region.object.center.x, y: region.object.center.y}})
        .persist()
        .name('wallOfFire')
        .fadeIn(300)
        .fadeOut(300)
        .aboveLighting()
        .play();

        // .sound()
        // .playIf(sound)
        // .file(sound)
}

async function drawLineRegion(template) {
    let visibilityRegion = undefined;

    // WALL: template.t = 'ray'  template.width = wall thicknesss  x, y origin point   template.direction is angle   template.distance = length
    let angle = Math.toDegrees(template.object.ray.angle);
    let dndFlags = template.flags.dnd5e;
    const height = dndFlags?.dimensions?.height ?? 20;
    const castLevel = dndFlags?.spellLevel ?? 4;
    const elevation = token.document.elevation ?? 0;

    let visionRegionData = {
        name: `${optionName} - Line`,
        color: game.user.color,
        shapes: [
            templateToRegionShape(template)
        ],
        elevation: {
            bottom: elevation,
            top: elevation + height
        },
        behaviors: [],
        visibility: 0,
        locked: false,
        flags: {
            'fvtt-trazzm-homebrew-5e': {
                castData: {
                    castLevel: castLevel,
                    saveDC: actor.system.attributes.spelldc
                },
                region: {
                    visibility: {
                        obscured: true
                    }
                },
                wallOfFire: {
                    casterUuid: actor.uuid,
                    origin: item.uuid
                }
            }
        }
    };


    let results = await token.scene.createEmbeddedDocuments("Region", [visionRegionData]);
    if (results && results.length > 0) {
        visibilityRegion = results[0];
        await drawLineAnimation(visibilityRegion, template);
        await drawLineWall(template);
    }

    return visibilityRegion;
}

async function drawLineWall(template) {
    const ray = Ray.fromAngle(template.x,
        template.y,
        template.direction * (Math.PI/180),
        template.distance * canvas.grid.size / canvas.dimensions.distance);

    let data = [];
    data.push({
        c: [ray.A.x, ray.A.y, ray.B.x, ray.B.y],
        move: CONST.WALL_MOVEMENT_TYPES.NONE,
        sense: CONST.WALL_SENSE_TYPES.NORMAL,
        dir: CONST.WALL_DIRECTIONS.BOTH,
        door: CONST.WALL_DOOR_TYPES.NONE,
        ds: CONST.WALL_DOOR_STATES.CLOSED,
        flags: { "fvtt-trazzm-homebrew-5e": { WallofFire: { ActorId: actor.id } } }
    });
    await token.scene.createEmbeddedDocuments("Wall", data);
}

function templateToRegionShape(template, {hole = false} = {}) {
    let origShape = template.object.shape ?? template.object._computeShape();
    let points = origShape.points ?? origShape.toPolygon().points;
    return {
        hole: hole,
        type: 'polygon',
        points: points.map((pt, ind) => ind % 2 ? pt + template.y : pt + template.x)
    };
}

async function drawLineAnimation(region, template) {
    await new Sequence()
        .effect()
        .file('jb2a.wall_of_fire.300x100.yellow')
        .atLocation({x: template.object.ray.A.x, y: template.object.ray.A.y})
        .stretchTo({x: template.object.ray.B.x, y: template.object.ray.B.y})
        .scale({x: 1.25, y: (15 / length) + .25})
        .persist()
        .name('wallOfFire')
        .tieToDocuments(region)
        .fadeIn(300)
        .fadeOut(300)
        .aboveLighting()
        .play();
}
