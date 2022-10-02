async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
const lastArg = args[args.length - 1];
let tactor;
if (lastArg.tokenId) tactor = canvas.tokens.get(lastArg.tokenId).actor;
else tactor = game.actors.get(lastArg.actorId);
const target = canvas.tokens.get(lastArg.tokenId);
const itemD = lastArg.efData.flags.dae.itemData;
const folderName = `Wildshape (${tactor.name})`;
const getFolder = game.folders.getName(folderName).content;
const folderContents = getFolder.reduce((acc, target) => acc += `<option value="${target.id}">${target.name} CR: ${target.data.data.details.cr}</option>`
    , ``);
const the_content = `<p>Pick a beast</p><form><div class="form-group"><label for="beast">Beast:</label><select id="beast">${folderContents}</select></div></form>`;
const druidItems = tactor.items.filter(i => i.data.type === "feat" && i.data.data.activation?.type != "bonus" && (i.data.data.requirements.toLowerCase().includes("druid") || i.data.data.requirements.toLowerCase().includes("circle"))).map(i => i.data);
const wildshapeHealing = [{
    "name": "Wild Shape Healing",
    "type": "spell",
    "img": "icons/magic/life/cross-beam-green.webp",
    "data": {
        "description": {
            "value": "<p>While you are transformed by Wild Shape, you can use a bonus action to expend one spell slot to regain 1d8 hit points per level of the spell slot expended.</p>",
            "chat": "<p>A creature you touch regains a number of hit points equal to 1d8 + your spellcasting ability modifier. This spell has no effect on undead or constructs.</p>\n<p><em><strong>At Higher Levels.</strong></em> When you cast this spell using a spell slot of 2nd level or higher, the healing increases by 1d8 for each slot level above 1st.</p>",
            "unidentified": ""
        },
        "activation": {
            "type": "action",
            "cost": 1,
            "condition": ""
        },
        "target": {
            "value": null,
            "width": null,
            "units": "",
            "type": "self"
        },
        "range": {
            "value": null,
            "long": null,
            "units": "self"
        },
        "actionType": "heal",
        "damage": {
            "parts": [
                [
                    "1d8",
                    "healing"
                ]
            ],
            "versatile": ""
        },
        "formula": "",
        "save": {
            "ability": "",
            "dc": null,
            "scaling": "spell"
        },
        "level": 1,
        "school": "evo",
        "components": {
            "value": "",
            "vocal": false,
            "somatic": true,
            "material": false,
            "ritual": false,
            "concentration": false
        },
        "preparation": {
            "mode": "prepared",
            "prepared": true
        },
        "scaling": {
            "mode": "level",
            "formula": "1"
        }
    },
    "effects": [],
    "sort": 0,
    "flags": {
        "favtab": {
            "isFavorite": true
        }
    }
}];
const wildshapeRevert = [{
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
        "target": {
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
                    "img": "icons/svg/dice-target.svg",
                    "scope": "global",
                    "command": "async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }\nconst lastArg = args[args.length - 1];\nlet tactor;\nif (lastArg.tokenId) tactor = canvas.tokens.get(lastArg.tokenId).actor;\nelse tactor = game.actors.get(lastArg.actor._id);\nlet target = canvas.tokens.get(lastArg.tokenId);\nlet getResources = tactor.data.data.resources.tertiary.value;\nlet getEffect = tactor.effects.find(i => i.data.label === \"Wild Shape\");\nlet effectActor = await game.actors.get(getEffect.data.changes[0].value);\nlet keys = Object.keys(tactor.data.data.spells);\nlet updates = keys.reduce((acc, values, i) => {\n    let primaryLabel = \"data.resources.primary.label\";\n    let primaryValue = \"data.resources.primary.value\";\n    let primaryMax = \"data.resources.primary.max\";\n    let secondaryLabel = \"data.resources.secondary.label\";\n    let secondaryValue = \"data.resources.secondary.value\";\n    let secondaryMax = \"data.resources.secondary.max\";\n    let tertiaryLabel = \"data.resources.tertiary.label\";\n    let tertiaryValue = \"data.resources.tertiary.value\";\n    let tertiaryMax = \"data.resources.tertiary.max\";\n    let spellMin = `data.spells.${values}.value`;\n    let spellMax = `data.spells.${values}.max`;\n    tactor.data.data.resources.primary.label != null ? acc[primaryLabel] = tactor.data.data.resources.primary.label : null;\n    tactor.data.data.resources.primary.label != null ? acc[primaryValue] = tactor.data.data.resources.primary.value : null;\n    tactor.data.data.resources.primary.label != null ? acc[primaryMax] = tactor.data.data.resources.primary.max : null;\n    tactor.data.data.resources.secondary.label != null ? acc[secondaryLabel] = tactor.data.data.resources.secondary.label : null;\n    tactor.data.data.resources.secondary.label != null ? acc[secondaryValue] = tactor.data.data.resources.secondary.value : null;\n    tactor.data.data.resources.secondary.label != null ? acc[secondaryMax] = tactor.data.data.resources.secondary.max : null;\n    tactor.data.data.resources.tertiary.label != null ? acc[tertiaryLabel] = tactor.data.data.resources.tertiary.label : null;\n    tactor.data.data.resources.tertiary.label != null ? acc[tertiaryValue] = tactor.data.data.resources.tertiary.value : null;\n    tactor.data.data.resources.tertiary.label != null ? acc[tertiaryMax] = tactor.data.data.resources.tertiary.max : null;\n    acc[spellMin] = Object.values(tactor.data.data.spells)[i].value;\n    acc[spellMax] = Object.values(tactor.data.data.spells)[i].max;\n    return acc;\n}, {});\nawait effectActor.update(updates);\nawait wait(500);\nconst getToken = duplicate(target.data);\nif ((!(game.modules.get(\"jb2a_patreon\")?.active) && !(game.modules.get(\"sequencer\")?.active))){\n    await tactor.revertOriginalForm();    \n    await effectActor.revertOriginalForm();        \n    await MidiQOL.socket().executeAsGM(\"removeEffects\", { actorUuid: effectActor.uuid, effects: [getEffect.id] });\n    await canvas.scene.updateEmbeddedDocuments(\"Token\", [{\"_id\": getToken._id, \"displayBars\" : CONST.TOKEN_DISPLAY_MODES.ALWAYS, \"mirrorX\" : getToken.mirrorX, \"mirrorY\" : getToken.mirrorY, \"rotation\" : getToken.rotation, \"elevation\": getToken.elevation}]);\n    await game.actors.get(tactor.id).delete();\n} else {\n    new Sequence()\n        .effect()\n        .atLocation(target)\n        .file(\"jb2a.misty_step.02.green\")\n        .scaleToObject(1.5)\n        .wait(1000)\n        .thenDo(async function(){            \n            await tactor.revertOriginalForm();            \n            await effectActor.revertOriginalForm();\n            await MidiQOL.socket().executeAsGM(\"removeEffects\", { actorUuid: effectActor.uuid, effects: [getEffect.id] });                       \n            await canvas.scene.updateEmbeddedDocuments(\"Token\", [{\"_id\": getToken._id, \"displayBars\" : CONST.TOKEN_DISPLAY_MODES.ALWAYS, \"mirrorX\" : getToken.mirrorX, \"mirrorY\" : getToken.mirrorY, \"rotation\" : getToken.rotation, \"elevation\": getToken.elevation}]);\n            await game.actors.get(tactor.id).delete();\n        })\n    .play()\n}",
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
}];

if ((args[0] === "on") && (!tactor.isPolymorphed)) {
    new Dialog({
        title: itemD.name,
        content: the_content,
        buttons: {
            change: {
                label: "Change", callback: async (html) => {
                    let polyId = html.find('#beast')[0].value;
                    let findToken = getFolder.find(i => i.id === polyId);
                    const getToken = duplicate(target.data);
                    if ((!(game.modules.get("jb2a_patreon")?.active) && !(game.modules.get("sequencer")?.active))) {
                        await tactor.transformInto(findToken, { keepBio: true, keepClass: true, keepMental: true, mergeSaves: true, mergeSkills: true, transformTokens: true });
                    } else {
                        new Sequence()
                            .effect()
                            .atLocation(target)
                            .file("jb2a.misty_step.01.green")
                            .scaleToObject(1.5)
                            .thenDo(async function () {
                                await tactor.transformInto(findToken, { keepBio: true, keepClass: true, keepMental: true, mergeSaves: true, mergeSkills: true, transformTokens: true });
                            })
                            .play()
                    }
                    await wait(1000);
                    let combatWildShape = tactor.items.find(i => i.name === "Combat Wild Shape");
                    let findPoly = await game.actors.find(i => i.name === `${tactor.name} (${findToken.name})`);
                    await canvas.scene.updateEmbeddedDocuments("Token", [{ "_id": getToken._id, "displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS, "mirrorX": getToken.mirrorX, "mirrorY": getToken.mirrorY, "rotation": getToken.rotation, "elevation": getToken.elevation }]);
                    let wsRevert = findPoly.items.find(i => i.name === "Wild Shape (Revert)");
                    let wsHealing = findPoly.items.find(i => i.name === "Wild Shape Healing");
                    let keys = Object.keys(tactor.data.data.spells);
                    let updates = keys.reduce((acc, values, i) => {
                        let primaryLabel = "data.resources.primary.label";
                        let primaryValue = "data.resources.primary.value";
                        let primaryMax = "data.resources.primary.max";
                        let secondaryLabel = "data.resources.secondary.label";
                        let secondaryValue = "data.resources.secondary.value";
                        let secondaryMax = "data.resources.secondary.max";
                        let tertiaryLabel = "data.resources.tertiary.label";
                        let tertiaryValue = "data.resources.tertiary.value";
                        let tertiaryMax = "data.resources.tertiary.max";
                        let spellMin = `data.spells.${values}.value`;
                        let spellMax = `data.spells.${values}.max`;
                        if (combatWildShape) {
                            acc[spellMin] = Object.values(tactor.data.data.spells)[i].value;
                            acc[spellMax] = Object.values(tactor.data.data.spells)[i].max;
                        }
                        if (tactor.data.data.resources.primary.label != null) {
                            acc[primaryLabel] = tactor.data.data.resources.primary.label;
                            acc[primaryValue] = tactor.data.data.resources.primary.value;
                            acc[primaryMax] = tactor.data.data.resources.primary.max;
                        }
                        if (tactor.data.data.resources.secondary.label != null) {
                            acc[secondaryLabel] = tactor.data.data.resources.secondary.label;
                            acc[secondaryValue] = tactor.data.data.resources.secondary.value;
                            acc[secondaryMax] = tactor.data.data.resources.secondary.max;
                        }
                        if (tactor.data.data.resources.tertiary.label != null) {
                            acc[tertiaryLabel] = tactor.data.data.resources.tertiary.label;
                            acc[tertiaryValue] = tactor.data.data.resources.tertiary.value;
                            acc[tertiaryMax] = tactor.data.data.resources.tertiary.max;
                        }
                        return acc;
                    }, {});
                    await findPoly.update(updates);
                    await findPoly.createEmbeddedDocuments("Item", druidItems);
                    if (!wsRevert) await findPoly.createEmbeddedDocuments("Item", wildshapeRevert);
                    if ((combatWildShape) && (!wsHealing)) await findPoly.createEmbeddedDocuments("Item", wildshapeHealing);
                }
            }
        },
        default: "change"
    }).render(true);
}

if ((args[0] === "on") && (tactor.isPolymorphed)) {
    let effect = tactor.effects.find(i => i.data.label === itemD.name);
    if (effect) await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: tactor.uuid, effects: [effect.id] });
}

if (args[0] === "off") {
    await tactor.revertOriginalForm();
}
