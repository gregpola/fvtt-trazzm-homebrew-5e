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

try {
    if (args[0] === "each") {
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
    console.error(`Cloudkill movement: ${version}`, err);
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
