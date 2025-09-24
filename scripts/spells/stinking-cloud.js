/*
    You create a 20-foot-radius Sphere of yellow, nauseating gas centered on a point within range. The cloud is Heavily
    Obscured. The cloud lingers in the air for the duration or until a strong wind (such as the one created by Gust of
    Wind) disperses it.

    Each creature that starts its turn in the Sphere must succeed on a Constitution saving throw or have the Poisoned
    condition until the end of the current turn. While Poisoned in this way, the creature can’t take an action or a
    Bonus Action.
 */
const version = "13.5.1";
const optionName = "Stinking Cloud";

const TEMPLATE_DARK_LIGHT = {
    "negative": true,
    "priority": 0,
    "alpha": 0.1,
    "angle": 360,
    "bright": 20,
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
        await game.trazzm.socket.executeAsGM("removeAmbientLight", 'StinkingCloud', actor);
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
                StinkingCloud: {
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
