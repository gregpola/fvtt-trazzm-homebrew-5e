/*
    You conjure up a wall of swirling sand on the ground at a point you can see within range. You can make the wall up
    to 30 feet long, 10 feet high, and 10 feet thick, and it vanishes when the spell ends. It blocks line of sight but
    not movement. A creature is blinded while in the wall’s space and must spend 3 feet of movement for every 1 foot it
    moves there.
*/
const version = "13.5.0";
const optionName = "Wall of Sand";

try {
    if (args[0].macroPass === "postActiveEffects") {
        if (workflow.template) {
            await drawLineWall(workflow.template);
        }
    }
    else if (args[0] === "off") {
        await game.trazzm.socket.executeAsGM("removeAmbientLight", 'WallofSand', actor);
        await game.trazzm.socket.executeAsGM("removeWalls", 'WallofSand', actor);
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
        flags: { spellEffects: { WallofSand: { ActorId: actor.uuid } } }
    });

    await game.trazzm.socket.executeAsGM("drawWalls", data);
}
