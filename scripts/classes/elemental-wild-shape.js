/*
    At 10th level, you can expend two uses of Wild Shape at the same time to transform into an air elemental, an earth
    elemental, a fire elemental, or a water elemental.
 */
const version = "11.0";
const optionName = "Elemental Wild Shape";
const cost = 2;
const invalidTypes = [
    'weapon',
    'equipment',
    'consumable',
    'tool',
    'container',
    'loot',
    'backpack'
];


const wildshapeHealing = {
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
        "token": {
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
        "target": {
            "value": 1,
            "width": null,
            "units": "",
            "type": "self"
        },
        "duration": {
            "value": "",
            "units": "inst"
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
            "formula": "1d8"
        }
    },
    "effects": [],
    "sort": 0,
    "flags": {
        "favtab": {
            "isFavorite": true
        }
    }
};

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
                        "let wsEffect = actor.effects.find(i => i.name === \"Elemental Wild Shape\");\n" +
                        "if (wsEffect) {\n" +
                        "    let effectActor = await game.actors.get(wsEffect.changes[0].value);\n" +
                        "    let keys = Object.keys(actor.system.spells);\n" +
                        "    let updates = keys.reduce((acc, values, i) => {\n" +
                        "        let spellMin = `system.spells.${values}.value`;\n" +
                        "        let spellMax = `system.spells.${values}.max`;\n" +
                        "        acc[spellMin] = Object.values(actor.system.spells)[i].value;\n" +
                        "        acc[spellMax] = Object.values(actor.system.spells)[i].max;\n" +
                        "        return acc;\n" +
                        "    }, {});\n" +
                        "    await effectActor.update(updates);\n" +
                        "    await wait(500);\n" +
                        "    const tokenData = duplicate(token.data);\n" +
                        "    new Sequence()\n" +
                        "    \t.effect()\n" +
                        "    \t.atLocation(token)\n" +
                        "    \t.file(\"jb2a.misty_step.02.red\")\n" +
                        "    \t.scaleToObject(1.5)\n" +
                        "    \t.wait(1000)\n" +
                        "    \t.thenDo(async function(){            \n" +
                        "    \t\tawait actor.revertOriginalForm();            \n" +
                        "    \t\tawait effectActor.revertOriginalForm();\n" +
                        "    \t\tawait MidiQOL.socket().executeAsGM(\"removeEffects\", { actorUuid: effectActor.uuid, effects: [wsEffect.id] });                       \n" +
                        "    \t\tawait canvas.scene.updateEmbeddedDocuments(\"Token\", [{\"_id\": tokenData._id, \"displayBars\" : CONST.TOKEN_DISPLAY_MODES.ALWAYS, \"mirrorX\" : tokenData.mirrorX, \"mirrorY\" : tokenData.mirrorY, \"rotation\" : tokenData.rotation, \"elevation\": tokenData.elevation}]);\n" +
                        "    \t}).play();\n" +
                        "}",
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

try {
	if (args[0].macroPass === "preItemRoll") {
        // check for Wild Shape uses remaining
        let wildShape = actor.items.find(i => i.name === "Wild Shape");
        if (wildShape) {
            let usesLeft = wildShape.system.uses?.value ?? 0;
            if (!usesLeft || usesLeft < cost) {
                console.error(`${optionName} - not enough Wild Shape uses left`);
                ui.notifications.error(`${optionName} - not enough Wild Shape uses left`);
                return false;
            }
            else {
                const newValue = wildShape.system.uses.value - cost;
                await wildShape.update({ "system.uses.value": newValue });
            }
        }
        else {
            console.error(`${optionName} - no Wild Shape item on actor`);
            ui.notifications.error(`${optionName} - no Wild Shape item on actor`);
            return false;
        }

        return true;
	}
	else if ((args[0] === "on") && (!actor.isPolymorphed)) {
        // ask which form to polymorph into
        let dialog = new Promise((resolve, reject) => {
            new Dialog({
                title: `${optionName}`,
                content: "<p>Which Elemental Wild Shape form?</p>",
                buttons: {
                    air: {
                        icon: '<img src = "modules/fvtt-trazzm-homebrew-5e/assets/monsters/npc-Air-Elemental.webp" width="50" height="50" />',
                        label: "<p>Air Elemental</p>",
                        callback: () => { resolve(
                            ["Air Elemental", "Compendium.fvtt-trazzm-homebrew-5e.homebrew-creatures.v4rQ1CQE42yEl1bj"]
                        ) }
                    },
                    earth: {
                        icon: '<img src = "modules/fvtt-trazzm-homebrew-5e/assets/monsters/npc-Earth-Elemental.webp" width="50" height="50" />',
                        label: "<p>Earth Elemental</p>",
                        callback: () => { resolve(
                            ["Earth Elemental", "Compendium.fvtt-trazzm-homebrew-5e.homebrew-creatures.Er3IcB2uBCAiVuAP"]
                        ) }
                    },
                    fire: {
                        icon: '<img src = "modules/fvtt-trazzm-homebrew-5e/assets/monsters/npc-Fire-Elemental.webp" width="50" height="50" />',
                        label: "<p>Fire Elemental</p>",
                        callback: () => { resolve(
                            ["Fire Elemental", "Compendium.fvtt-trazzm-homebrew-5e.homebrew-creatures.uCSmT6sljSrBXLwt"]
                        ) }
                    },
                    water: {
                        icon: '<img src = "modules/fvtt-trazzm-homebrew-5e/assets/monsters/npc-Water-Elemental.webp" width="50" height="50" />',
                        label: "<p>Water Elemental</p>",
                        callback: () => { resolve(
                            ["Water Elemental", "Compendium.fvtt-trazzm-homebrew-5e.homebrew-creatures.TVjN6jTT3wUm1TKk"]
                        ) }
                    }
                }
            }).render(true);
        });

        let elementalForm = await dialog;
        if (elementalForm) {
            // items that can be moved to the new shape
            let druidItems = actor.items.filter(i => invalidTypes.includes(i.type) && !i.system.equipped);
            let itemUpdates = {};
            for (let i of druidItems) {
                itemUpdates[i.name] = warpgate.CONST.DELETE
            }

            // get the shape actor
            const shapeName = elementalForm[0];
            let shapeActor = game.actors.getName(shapeName);
            if (!shapeActor) {
                const compendiumId = elementalForm[1];

                // Get from the compendium
                let entity = await fromUuid(compendiumId);
                if (!entity) {
                    ui.notifications.error(`${optionName} - unable to find the actor`);
                    return false;
                }

                // import the actor
                const shapeId = compendiumId.substring(compendiumId.lastIndexOf(".") + 1);
                let document = await entity.collection.importFromCompendium(game.packs.get(entity.pack), shapeId, {});
                if (!document) {
                    ui.notifications.error(`${optionName} - unable to import from the compendium`);
                    return false;
                }
                await warpgate.wait(500);
                shapeActor = game.actors.getName(shapeName);
            }

            // transform the actor
            const tokenData = duplicate(token.data);
            new Sequence()
                .effect()
                .atLocation(token)
                .file("jb2a.misty_step.02.red")
                .scaleToObject(1.5)
                .thenDo(async function () {
                    await actor.transformInto(shapeActor, { keepBio: true, keepClass: true, keepMental: true, mergeSaves: true, mergeSkills: true, transformTokens: true });
                })
                .play()

            await wait(1000);

            // look for actor features
            let combatWildShape = actor.items.find(i => i.name === "Combat Wild Shape");
            let findPoly = await game.actors.find(i => i.name === `${actor.name} (${shapeActor.name})`);
            await canvas.scene.updateEmbeddedDocuments("Token", [{ "_id": tokenData._id, "displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS, "mirrorX": tokenData.mirrorX, "mirrorY": tokenData.mirrorY, "rotation": tokenData.rotation, "elevation": tokenData.elevation }]);
            let wsRevert = findPoly.items.find(i => i.name === "Wild Shape (Revert)");
            let wsHealing = findPoly.items.find(i => i.name === "Wild Shape Healing");
            let keys = Object.keys(actor.system.spells);
            let updates = keys.reduce((acc, values, i) => {
                let spellMin = `system.spells.${values}.value`;
                let spellMax = `system.spells.${values}.max`;
                if (combatWildShape) {
                    acc[spellMin] = Object.values(actor.system.spells)[i].value;
                    acc[spellMax] = Object.values(actor.system.spells)[i].max;
                }
                return acc;
            }, {});
            await findPoly.update(updates);

            // build the item updates array
            let itemUpdateArray = Object.values(itemUpdates);
            if (!wsRevert) {
                itemUpdateArray.push(wildshapeRevert);
            }

            if ((combatWildShape) && (!wsHealing)) {
                itemUpdateArray.push(wildshapeHealing);
            }

            await findPoly.createEmbeddedDocuments("Item", itemUpdateArray);
        }
	}
	else if ((args[0] === "on") && (actor.isPolymorphed)) {
		let effect = actor.effects.find(i => i.name === optionName);
		if (effect) await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [effect.id] });
	}
	else if (args[0] === "off") {
		let originalActor = await actor.revertOriginalForm();
        if (originalActor) {
            let itemEffect = originalActor.effects.find(i => i.name === optionName);
            if (itemEffect) {
                await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: originalActor.uuid, effects: [itemEffect.id] });
            }
        }
	}	
} catch (err) {
    console.error(`${optionName} ${version}`, err);
}

async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
