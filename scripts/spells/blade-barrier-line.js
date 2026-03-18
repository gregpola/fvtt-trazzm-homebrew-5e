/*
    You create a wall of whirling blades made of magical energy. The wall appears within range and lasts for the duration.
    You make a straight wall up to 100 feet long, 20 feet high, and 5 feet thick, or a ringed wall up to 60 feet in
    diameter, 20 feet high, and 5 feet thick. The wall provides Three-Quarters Cover, and its space is Difficult Terrain.

    Any creature in the wall’s space makes a Dexterity saving throw, taking 6d10 Force damage on a failed save or half
    as much damage on a successful one. A creature also makes that save if it enters the wall’s space or ends it turn
    there. A creature makes that save only once per turn.
*/
const version = "13.5.0";
const optionName = "Blade Barrier";

try {
    if (args[0].macroPass === "postActiveEffects") {
        if (workflow.template) {
            await drawLineWall(workflow.template);
        }
    }
    else if (args[0] === "off") {
        await game.trazzm.socket.executeAsGM("removeAmbientLight", 'BladeBarrier', actor);
        await game.trazzm.socket.executeAsGM("removeWalls", 'BladeBarrier', actor);
    }

} catch (err) {
    console.error(`${optionName} : ${version}`, err);
}

async function drawLineWall(template) {
    const ray = foundry.canvas.geometry.Ray.fromAngle(template.x,
        template.y,
        template.direction * (Math.PI/180),
        template.distance * canvas.grid.size / canvas.dimensions.distance);

    let data = [];
    data.push({
        c: [ray.A.x, ray.A.y, ray.B.x, ray.B.y],
        move: CONST.WALL_MOVEMENT_TYPES.NONE,
        sense: CONST.WALL_SENSE_TYPES.NONE,
        dir: CONST.WALL_DIRECTIONS.BOTH,
        door: CONST.WALL_DOOR_TYPES.NONE,
        ds: CONST.WALL_DOOR_STATES.CLOSED,
        flags: { spellEffects: { BladeBarrier: { ActorId: actor.uuid } } }
    });

    await game.trazzm.socket.executeAsGM("drawWalls", data);
}
