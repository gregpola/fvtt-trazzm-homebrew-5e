/*
    Select the tile created by a template that has walls and run the macro to remove the walls
 */
const version = "11.0";

// get the selected template
const templateTile = canvas.tiles.controlled[0];
if (templateTile) {
    let templateWalls = canvas.walls.placeables.filter(w => w.document.flags["fvtt-trazzm-homebrew-5e"]?.TemplateId === templateTile.id)
    let wallArray = templateWalls.map(function (w) {
        return w.document._id;
    })

    await canvas.scene.deleteEmbeddedDocuments("Wall", wallArray);
    await templateTile.document.delete();
}
