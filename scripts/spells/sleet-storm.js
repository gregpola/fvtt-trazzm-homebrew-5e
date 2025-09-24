/*
    Until the spell ends, sleet falls in a 40-foot-tall, 20-foot-radius Cylinder centered on a point you choose within
    range. The area is Heavily Obscured, and exposed flames in the area are doused.

    Ground in the Cylinder is Difficult Terrain. When a creature enters the Cylinder for the first time on a turn or
    starts its turn there, it must succeed on a Dexterity saving throw or have the Prone condition and lose Concentration.
*/
const optionName = "Sleet Storm";
const version = "13.5.1";

const TEMPLATE_DARK_LIGHT = {
    "negative": true,
    "priority": 0,
    "alpha": 0.1,
    "angle": 360,
    "bright": 18,
    "color": null,
    "coloration": 1,
    "dim": 0,
    "attenuation": 0.75,
    "luminosity": 0.75,
    "saturation": 0,
    "contrast": 0,
    "shadows": 0,
    "animation": {
        "type": null,
        "speed": 5,
        "intensity": 5,
        "reverse": false
    },
    "darkness": {
        "min": 0,
        "max": 1
    }
};

try {
    if (args[0].macroPass === "postActiveEffects") {
        if (workflow.template) {
            await drawAmbientLight(workflow.template, actor);
        }
    }
    else if (args[0] === "off") {
        await game.trazzm.socket.executeAsGM("removeAmbientLight", 'SleetStorm', actor);
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function drawAmbientLight(template, actor) {
    const config = TEMPLATE_DARK_LIGHT;
    config.bright = template.distance - 2;

    const lightTemplate = {
        x: template.x,
        y: template.y,
        rotation: 0,
        walls: false,
        vision: false,
        config,
        hidden: false,
        flags: {
            spellEffects: {
                SleetStorm: {
                    ActorId: actor.uuid,
                },
            },
            "perfect-vision": {
                resolution: 1,
                visionLimitation: {
                    enabled: true,
                    sight: 0,
                    detection: {
                        feelTremor: null,
                        seeAll: null,
                        seeInvisibility: 0,
                        senseAll: null,
                        senseInvisibility: null,
                    },
                },
            },
        },
    };

    await game.trazzm.socket.executeAsGM("drawAmbientLight", lightTemplate);
}
