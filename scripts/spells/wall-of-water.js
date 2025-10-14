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
const version = "13.5.0";
const optionName = "Wall of Water";

try {
    if (args[0].macroPass === "postActiveEffects") {
        if (workflow.template) {
            await drawLineWall(workflow.template);
        }
    }
    else if (args[0] === "off") {
        await game.trazzm.socket.executeAsGM("removeAmbientLight", 'WallofWater', actor);
        await game.trazzm.socket.executeAsGM("removeWalls", 'WallofWater', actor);
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
        flags: { spellEffects: { WallofWater: { ActorId: actor.uuid } } }
    });

    await game.trazzm.socket.executeAsGM("drawWalls", data);
}
