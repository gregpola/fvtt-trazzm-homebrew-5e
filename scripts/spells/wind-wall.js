/*
     A wall of strong wind rises from the ground at a point you choose within range. You can make the wall up to 50 feet
     long, 15 feet high, and 1 foot thick. You can shape the wall in any way you choose so long as it makes one
     continuous path along the ground. The wall lasts for the duration.

     When the wall appears, each creature in its area makes a Strength saving throw, taking 4d8 Bludgeoning damage on a
     failed save or half as much damage on a successful one.

     The strong wind keeps fog, smoke, and other gases at bay. Small or smaller flying creatures or objects can’t pass
     through the wall. Loose, lightweight materials brought into the wall fly upward. Arrows, bolts, and other ordinary
     projectiles launched at targets behind the wall are deflected upward and miss automatically. Boulders hurled by
     Giants or siege engines, and similar projectiles, are unaffected. Creatures in gaseous form can’t pass through it.
*/
const version = "12.4.0";
const optionName = "Wind Wall";
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
                const lineRegion = await drawLineRegion(template);
                if (lineRegion) {
                    await actor.setFlag(_flagGroup, templateFlag, {templateUuid: template.uuid, templateRegionId: lineRegion.id});
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
                        obscured: false
                    }
                },
                WindWall: {
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
        .file('jb2a.wind_wall.300x100')
        .atLocation({x: template.object.ray.A.x, y: template.object.ray.A.y})
        .stretchTo({x: template.object.ray.B.x, y: template.object.ray.B.y})
        .scale({x: 1.25, y: (15 / length) + .25})
        .persist()
        .name('WindWall')
        .tieToDocuments(region)
        .fadeIn(300)
        .fadeOut(300)
        .aboveLighting()
        .play();
}
