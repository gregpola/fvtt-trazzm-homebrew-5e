/*
    You conjure up a wall of swirling sand on the ground at a point you can see within range. You can make the wall up
    to 30 feet long, 10 feet high, and 10 feet thick, and it vanishes when the spell ends. It blocks line of sight but
    not movement. A creature is blinded while in the wall’s space and must spend 3 feet of movement for every 1 foot it
    moves there.
*/
const version = "12.4.0";
const optionName = "Wall of Sand";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const templateFlag = "wall-of-sand-template-uuid";
const wallTemplateName = "WallofSandTemplate";

try {
    if (args[0].macroPass === "preItemRoll") {
        Hooks.once("createMeasuredTemplate", async (template) => {
            await actor.setFlag(_flagGroup, templateFlag, {templateUuid: template.uuid});

            await template.update({
                fillColor: 0,
                fillAlpha: 0,
                alpha: 0,
                opacity: 0.1
            });
        });

        Hooks.once("createRegion", async (region) => {
            //await region.update({'visibility': 0});
        });
    }
    else if (args[0] === "on") {
        let flag = actor.getFlag(_flagGroup, templateFlag);
        if (flag) {
            const template = await fromUuidSync(flag.templateUuid);
            if (template) {
                await HomebrewHelpers.drawWallTemplateWalls(template, wallTemplateName, actor.id);
            }
        }
    }
    else if (args[0] === "off") {
        // delete walls
        async function removeWalls() {
            let walls = token.scene.walls.filter(w => w.flags["fvtt-trazzm-homebrew-5e"]?.template?.ActorId === actor.id
                && w.flags["fvtt-trazzm-homebrew-5e"]?.template?.TemplateName === wallTemplateName);
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
    }

} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}
