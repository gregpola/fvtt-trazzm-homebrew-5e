/*
    You open a gateway to the Far Realm, a region infested with unspeakable horrors. A 20-foot-radius Sphere of
    [Darkness] appears, centered on a point with range and lasting for the duration. The Sphere is [DifficultTerrain],
    and it is filled with strange whispers and slurping noises, which can be heard up to 30 feet away. No light, magical
    or otherwise, can illuminate the area, and creatures fully within it have the [Blinded] condition.

    Any creature that starts its turn in the area takes 2d6 Cold damage. Any creature that ends its turn there must
    succeed on a Dexterity saving throw or take 2d6 Acid damage from otherworldly tentacles.

    Using a Higher-Level Spell Slot. The Cold or Acid damage (your choice) increases by 1d6 for each spell slot level above 3.
 */
const version = "13.5.0";
const optionName = "Hunger of Hadar";

const TEMPLATE_DARK_LIGHT = {
    "negative": true,
    "priority": 0,
    "alpha": 0.1,
    "angle": 360,
    "bright": 19,
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
        await game.trazzm.socket.executeAsGM("removeAmbientLight", 'HungerOfHadar', actor);
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
                HungerOfHadar: {
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
