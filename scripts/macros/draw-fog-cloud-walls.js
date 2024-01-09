/*
    Select the tile created by the Fog Cloud spell (it's a foreground tile) and then run this macro.

    Remember to manually delete the walls after the spell expires.
 */
const version = "11.0";

// get the darkness tile
const fogCloudTile = canvas.tiles.controlled[0];
if (fogCloudTile) {
    const radius = 4 * canvas.grid.size; // radius in grids * gridsize
    await circleWall(fogCloudTile.center.x, fogCloudTile.center.y, radius);
}

async function circleWall(cx, cy, radius) {
    let data = [];
    const step = 15;
    for (let i = step; i <= 360; i += step) {
        let theta0 = Math.toRadians(i - step);
        let theta1 = Math.toRadians(i);

        let lastX = Math.floor(radius * Math.cos(theta0) + cx);
        let lastY = Math.floor(radius * Math.sin(theta0) + cy);
        let newX = Math.floor(radius * Math.cos(theta1) + cx);
        let newY = Math.floor(radius * Math.sin(theta1) + cy);

        data.push({
            c: [lastX, lastY, newX, newY],
            move: CONST.WALL_MOVEMENT_TYPES.NONE,
            sense: CONST.WALL_SENSE_TYPES.NORMAL,
            dir: CONST.WALL_DIRECTIONS.BOTH,
            door: CONST.WALL_DOOR_TYPES.NONE,
            ds: CONST.WALL_DOOR_STATES.CLOSED
        });
    }

    await canvas.scene.createEmbeddedDocuments("Wall", data)
}
