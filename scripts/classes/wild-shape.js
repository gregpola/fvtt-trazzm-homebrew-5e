const version = "11.1";
const optionName = "Wild Shape";
const cost = 1;
const invalidTypes = [
    'weapon',
    'equipment',
    'consumable',
    'tool',
    'container',
    'loot',
    'backpack'
];

try {
	if ((args[0] === "on") && (!actor.isPolymorphed)) {
		const folderName = `Wildshape (${actor.name})`;
		const theFolder = game.folders.getName(folderName);
		if (!theFolder) {
			return ui.notifications.error(`${optionName} - unable to locate the folder: ${folderName}`);
		}
		if (!theFolder.content) {
			return ui.notifications.error(`${optionName} - the folder is empty`);
		}
		
		const folderContents = theFolder.content.reduce((acc, token) => acc += `<option value="${token.id}">${token.name} CR: ${token.system.details.cr}</option>`, ``);
		if (folderContents.length === 0) {
			return ui.notifications.error(`${optionName} - the actor has no options defined`);
		}

		const the_content = `<form><div class="form-group"><label for="beast">Beast:</label><br /><select id="beast">${folderContents}</select></div></form>`;

        // items that can be moved to the new shape
        let druidItems = actor.items.filter(i => invalidTypes.includes(i.type) && !i.system.equipped);
        let itemUpdates = {};
        for (let i of druidItems) {
            itemUpdates[i.name] = warpgate.CONST.DELETE
        }

		// Ask for the form
		new Dialog({
			title: optionName,
			content: the_content,
			buttons: {
				change: {
					label: "Change", callback: async (html) => {
						let polyId = html.find('#beast')[0].value;
						let findToken = theFolder.content.find(i => i.id === polyId);
						const getToken = duplicate(token.data);
						if ((!(game.modules.get("jb2a_patreon")?.active) && !(game.modules.get("sequencer")?.active))) {
							await actor.transformInto(findToken, { keepBio: true, keepClass: true, keepMental: true, mergeSaves: true, mergeSkills: true, transformTokens: true });
						} else {
							new Sequence()
								.effect()
								.atLocation(token)
								.file("jb2a.misty_step.02.blue")
								.scaleToObject(1.5)
								.thenDo(async function () {
									await actor.transformInto(findToken, { keepBio: true, keepClass: true, keepMental: true, mergeSaves: true, mergeSkills: true, transformTokens: true });
								})
								.play()
						}
						await wait(1000);
						let combatWildShape = actor.items.find(i => i.name === "Combat Wild Shape");
						let findPoly = await game.actors.find(i => i.name === `${actor.name} (${findToken.name})`);
						await canvas.scene.updateEmbeddedDocuments("Token", [{ "_id": getToken._id, "displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS, "mirrorX": getToken.mirrorX, "mirrorY": getToken.mirrorY, "rotation": getToken.rotation, "elevation": getToken.elevation }]);
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
			},
			default: "change"
		}).render(true);
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
