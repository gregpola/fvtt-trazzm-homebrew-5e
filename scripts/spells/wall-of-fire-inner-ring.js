/*
    You create a wall of fire on a solid surface within range. You can make the wall up to 60 feet long, 20 feet high,
    and 1 foot thick, or a ringed wall up to 20 feet in diameter, 20 feet high, and 1 foot thick. The wall is opaque and
    lasts for the duration.
*/
const version = "13.5.0";
const optionName = "Wall of Fire";

try {
    if (args[0].macroPass === "postActiveEffects") {
        if (workflow.template) {
            await drawCircleWall(workflow.template);
        }
    }
    else if (args[0] === "off") {
        await game.trazzm.socket.executeAsGM("removeAmbientLight", 'WallofFire', actor);
        await game.trazzm.socket.executeAsGM("removeWalls", 'WallofFire', actor);
    }

} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}

async function drawCircleWall(template) {
    const radius = canvas.grid.size * ((template.distance - .15) / canvas.grid.distance);

    let data = [];
    const step = 15;
    for (let i = step; i <= 360; i += step) {
        let theta0 = Math.toRadians(i - step);
        let theta1 = Math.toRadians(i);

        let lastX = Math.floor(radius * Math.cos(theta0) + template.x);
        let lastY = Math.floor(radius * Math.sin(theta0) + template.y);
        let newX = Math.floor(radius * Math.cos(theta1) + template.x);
        let newY = Math.floor(radius * Math.sin(theta1) + template.y);

        data.push({
            c: [lastX, lastY, newX, newY],
            move: CONST.WALL_MOVEMENT_TYPES.NONE,
            sense: CONST.WALL_SENSE_TYPES.NORMAL,
            dir: CONST.WALL_DIRECTIONS.BOTH,
            door: CONST.WALL_DOOR_TYPES.NONE,
            ds: CONST.WALL_DOOR_STATES.CLOSED,
            flags: { spellEffects: { WallofFire: { ActorId: actor.uuid } } }
        });
    }

    await game.trazzm.socket.executeAsGM("drawWalls", data);
}
