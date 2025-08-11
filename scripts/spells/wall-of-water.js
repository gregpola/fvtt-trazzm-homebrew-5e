/*
    You create a wall of water on the ground at a point you can see within range. You can make the wall up to 30 feet
    long, 10 feet high, and 1 foot thick, or you can make a ringed wall up to 20 feet in diameter, 20 feet high, and
    1 foot thick. The wall vanishes when the spell ends. The wall’s space is difficult terrain.

    Any ranged weapon attack that enters the wall’s space has disadvantage on the attack roll, and fire damage is halved
    if the fire effect passes through the wall to reach its target. Spells that deal cold damage that pass through the
    wall cause the area of the wall they pass through to freeze solid (at least a 5-foot-square section is frozen). Each
    5-foot-square frozen section has AC 5 and 15 hit points. Reducing a frozen section to 0 hit points destroys it. When
    a section is destroyed, the wall’s water doesn’t fill it.
*/
const version = "12.4.0";
const optionName = "Wall of Water";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const templateFlag = "wall-template-uuid";

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
                    saveDC: actor.system.attributes.spell.dc
                },
                region: {
                    visibility: {
                        obscured: false
                    }
                },
                WallofWater: {
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
        //await drawCircleWall(template);
    }

    return visibilityRegion;
}

async function drawCircleAnimation(region) {
    await new Sequence()
        .effect()
        .file('jb2a.wall_of_fire.Ring.blue')
        .scaleToObject(1.05)
        .attachTo(region, {offset: {x: region.object.center.x, y: region.object.center.y}})
        .persist()
        .name('WallofWater')
        .fadeIn(300)
        .fadeOut(300)
        .aboveLighting()
        .play();
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
                    saveDC: actor.system.attributes.spell.dc
                },
                region: {
                    visibility: {
                        obscured: false
                    }
                },
                WallofWater: {
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
        //await drawLineWall(template);
    }

    return visibilityRegion;
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
        .file('jb2a.wall_of_fire.300x100.blue')
        .atLocation({x: template.object.ray.A.x, y: template.object.ray.A.y})
        .stretchTo({x: template.object.ray.B.x, y: template.object.ray.B.y})
        .scale({x: 1.25, y: (15 / length) + .25})
        .persist()
        .name('WallofWater')
        .tieToDocuments(region)
        .fadeIn(300)
        .fadeOut(300)
        .aboveLighting()
        .play();
}
