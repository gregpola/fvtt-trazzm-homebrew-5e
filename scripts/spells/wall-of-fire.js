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
            await drawLineWall(workflow.template);
        }
    }
    else if (args[0] === "off") {
        await game.trazzm.socket.executeAsGM("removeAmbientLight", 'WallofFire', actor);
        await game.trazzm.socket.executeAsGM("removeWalls", 'WallofFire', actor);
    }

} catch (err) {
    console.error(`${optionName} : ${version}`, err);
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
        flags: { spellEffects: { WallofFire: { ActorId: actor.uuid } } }
    });

    await game.trazzm.socket.executeAsGM("drawWalls", data);
}
