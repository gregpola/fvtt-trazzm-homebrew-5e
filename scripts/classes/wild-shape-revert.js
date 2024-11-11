const version = "12.3.0";
const optionName = "Revert Wild Shape";
const wildShapeName = "Wild Shape";

try {
    if (args[0].macroPass === "postActiveEffects") {
        if (actor.isPolymorphed) {
            let originalActor = await actor.revertOriginalForm();
            if (originalActor) {
                let itemEffect = HomebrewHelpers.findEffect(originalActor, wildShapeName);
                if (itemEffect) {
                    await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: originalActor.uuid, effects: [itemEffect.id] });
                }

                let wildShapeFeature = actor.items.find(i => i.name === "Revert Wild Shape");
                if (wildShapeFeature) {
                    wildShapeFeature.delete();
                }

                wildShapeFeature = actor.items.find(i => i.name === "Wild Shape Healing");
                if (wildShapeFeature) {
                    wildShapeFeature.delete();
                }

                // TODO maybe token changes???
            }
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

/*
const wildshapeRevert = {
    "name": "Wild Shape (Revert)",
    "type": "feat",
    "img": "icons/creatures/mammals/elk-moose-marked-green.webp",
    "data": {
        "description": {
            "value": "<p class=\"compendium-hr\">Starting at 2nd level, you can use your action to magically assume the shape of a beast that you have seen before. You can use this feature twice. You regain expended uses when you finish a short or long rest.</p>"
        },
        "activation": {
            "type": "action",
            "cost": 1
        },
        "token": {
            "type": "self"
        },
        "range": {
            "units": "self"
        },
        "actionType": "util",
        "requirements": "Druid"
    },
    "flags": {
        "core": {
            "sourceId": "Item.GDRnvEUCgN7N5nkW"
        },
        "itemacro": {
            "macro": {
                "data": {
                    "_id": null,
                    "name": "Wild Shape (Revert)",
                    "type": "script",
                    "author": "Tyd5yiqWrRZMvG30",
                    "img": "icons/svg/dice-token.svg",
                    "scope": "global",
                    "command": "async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }\n" +
                        "let wsEffect = actor.effects.find(i => i.name === \"Wild Shape\");\n" +
                        "if (!wsEffect) return;\n" +
                        "let effectActor = await game.actors.get(wsEffect.changes[0].value);\n" +
                        "let keys = Object.keys(actor.system.spells);\n" +
                        "let updates = keys.reduce((acc, values, i) => {\n" +
                        "    let spellMin = `system.spells.${values}.value`;\n" +
                        "    let spellMax = `system.spells.${values}.max`;\n" +
                        "    acc[spellMin] = Object.values(actor.system.spells)[i].value;\n" +
                        "    acc[spellMax] = Object.values(actor.system.spells)[i].max;\n" +
                        "    return acc;\n" +
                        "}, {});\n" +
                        "await effectActor.update(updates);\n" +
                        "await wait(500);\n" +
                        "const getToken = duplicate(token.data);\n" +
                        "new Sequence()\n" +
                        "\t.effect()\n" +
                        "\t.atLocation(token)\n" +
                        "\t.file(\"jb2a.misty_step.02.green\")\n" +
                        "\t.scaleToObject(1.5)\n" +
                        "\t.wait(1000)\n" +
                        "\t.thenDo(async function(){            \n" +
                        "\t\tawait actor.revertOriginalForm();            \n" +
                        "\t\tawait effectActor.revertOriginalForm();\n" +
                        "\t\tawait MidiQOL.socket().executeAsGM(\"removeEffects\", { actorUuid: effectActor.uuid, effects: [wsEffect.id] });                       \n" +
                        "\t\tawait canvas.scene.updateEmbeddedDocuments(\"Token\", [{\"_id\": getToken._id, \"displayBars\" : CONST.TOKEN_DISPLAY_MODES.ALWAYS, \"mirrorX\" : getToken.mirrorX, \"mirrorY\" : getToken.mirrorY, \"rotation\" : getToken.rotation, \"elevation\": getToken.elevation}]);\n" +
                        "\t}).play();",
                    "folder": null,
                    "sort": 0,
                    "permission": {
                        "default": 0
                    },
                    "flags": {}
                }
            }
        },
        "favtab": {
            "isFavorite": true
        },
        "midi-qol": {
            "onUseMacroName": "[postActiveEffects]ItemMacro",
            "effectActivation": false
        }
    }
};

 */
