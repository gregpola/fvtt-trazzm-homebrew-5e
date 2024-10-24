/*
    You speak a one-word command to a creature you can see within range. The target must succeed on a Wisdom saving throw
    or follow the command on its next turn. The spell has no effect if the target is undead, if it doesn’t understand
    your language, or if your command is directly harmful to it.

    Higher Levels. When you cast this spell using a spell slot of 2nd level or higher, you can affect one additional
    creature for each slot level above 1st. The creatures must be within 30 feet of each other when you target them.
 */
const optionName = "Command";
const version = "12.3.0";

try {
    if ((args[0].macroPass === "postActiveEffects") && (workflow.failedSaves.size > 0)) {
        // ask which type of command
        let content = `
            <label><input type="radio" name="choice" value="approach" checked>  Approach </label>
            <label><input type="radio" name="choice" value="drop">  Drop </label>
            <label><input type="radio" name="choice" value="flee">  Flee </label>
            <label><input type="radio" name="choice" value="grovel">  Grovel </label>
            <label><input type="radio" name="choice" value="halt">  Halt </label>
        `;

        let theCommand = await foundry.applications.api.DialogV2.prompt({
            content: content,
            rejectClose: false,
            ok: {
                callback: (event, button, dialog) => {
                    return button.form.elements.choice.value;
                }
            },
            window: {
                title: 'Select the Command'
            },
            position: {
                width: 400
            }
        });

        if (theCommand) {
            ChatMessage.create({
                content: `${actor.name} yells out ${theCommand}`,
                speaker: ChatMessage.getSpeaker({actor: actor})
            });

            for (let target of workflow.failedSaves) {
                await applyCommand(target.actor, macroItem, theCommand);
            }
        }

    }
    else if (args[0] === "each") {
        // get the source token
        const sourceToken = canvas.scene.tokens.find(t => t.actor.id === macroItem.parent.id);

        // check which command
        if (HomebrewHelpers.findEffect(actor, "Command - Approach")) {
            const tokenDistance = MidiQOL.computeDistance(sourceToken, token) - 5;
            const moveDistance = Math.min(tokenDistance, HomebrewHelpers.maxMovementRate(actor));
            await MidiQOL.moveTokenAwayFromPoint(token, -moveDistance, {x: sourceToken.x, y: sourceToken.y});

            ChatMessage.create({
                content: `${actor.name} is compelled to move towards ${sourceToken.name}`,
                speaker: ChatMessage.getSpeaker({actor: actor})
            });

        }
        else if (HomebrewHelpers.findEffect(actor, "Command - Drop")) {
            let possibleItems = actor.items.filter(i => i.system.equipped &&
                (i.type === 'weapon' ||
                    i.system.type.value.toLowerCase() === 'trinket' ||
                    i.system.type.value.toLowerCase() === 'wand' ||
                    i.system.type.value.toLowerCase() === 'potion' ));

            if (possibleItems) {
                const itemIndex = Math.floor(Math.random() * possibleItems.length);
                const droppedItem = possibleItems[itemIndex];
                if (droppedItem) {
                    let pile = await game.itempiles.API.createItemPile({
                        position: {
                            x: token.x + canvas.grid.size,
                            y: token.y
                        },
                        tokenOverrides: {
                            img: droppedItem.img,
                            width: 0.5,
                            height: 0.5,
                            name: droppedItem.name
                        },
                        items: [
                            {
                                item: droppedItem,
                                quantity: 1
                            }
                        ]
                    });

                    await game.itempiles.API.removeItems(actor, [{ item: droppedItem, quantity: 1 }]);
                }
            }

            ChatMessage.create({
                content: `${actor.name} is compelled to drop `,
                speaker: ChatMessage.getSpeaker({actor: actor})
            });

        }
        else if (HomebrewHelpers.findEffect(actor, "Command - Flee")) {
            await MidiQOL.moveTokenAwayFromPoint(token, HomebrewHelpers.maxMovementRate(actor), {x: sourceToken.x, y: sourceToken.y});
            ChatMessage.create({
                content: `${actor.name} is compelled to run away from ${sourceToken.name}`,
                speaker: ChatMessage.getSpeaker({actor: actor})
            });

        }
        else if (HomebrewHelpers.findEffect(actor, "Command - Grovel")) {
            if (!actor.statuses.has("prone")) {
                await game.dfreds.effectInterface.addEffect({effectName: 'Prone', uuid: actor.uuid});
            }
            ChatMessage.create({
                content: `${actor.name} is compelled to fall prone and grovel`,
                speaker: ChatMessage.getSpeaker({actor: actor})
            });
        }
        else if (HomebrewHelpers.findEffect(actor, "Command - Halt")) {
            game.combat.nextTurn();
            ChatMessage.create({
                content: `${actor.name} is compelled to do nothing`,
                speaker: ChatMessage.getSpeaker({actor: actor})
            });

        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function applyCommand(actor, item, command) {
    let effectData;

    switch(command) {
        case 'approach':
            effectData = {
                name: 'Command - Approach',
                icon: item.img,
                origin: item.uuid,
                flags: {
                    dae: {
                        'macroRepeat': 'startEveryTurn',
                        'specialDuration': ['turnEnd']
                    }
                },
                changes: [
                    {
                        "key": "macro.itemMacro",
                        "mode": CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        "value": "",
                        "priority": 20
                    }
                ]
            };
            break;

        case 'drop':
            effectData = {
                name: 'Command - Drop',
                icon: item.img,
                origin: item.uuid,
                flags: {
                    dae: {
                        'macroRepeat': 'startEveryTurn',
                        'specialDuration': ['turnEnd']
                    }
                },
                changes: [
                    {
                        "key": "macro.itemMacro",
                        "mode": CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        "value": "",
                        "priority": 20
                    }
                ]
            };
            break;

        case 'flee':
            effectData = {
                name: 'Command - Flee',
                icon: item.img,
                origin: item.uuid,
                flags: {
                    dae: {
                        'macroRepeat': 'startEveryTurn',
                        'specialDuration': ['turnEnd']
                    }
                },
                changes: [
                    {
                        "key": "macro.itemMacro",
                        "mode": CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        "value": "",
                        "priority": 20
                    }
                ]
            };
            break;

        case 'grovel':
            effectData = {
                name: 'Command - Grovel',
                icon: item.img,
                origin: item.uuid,
                flags: {
                    dae: {
                        'macroRepeat': 'startEveryTurn',
                        'specialDuration': ['turnEnd']
                    }
                },
                changes: [
                    {
                        "key": "macro.itemMacro",
                        "mode": CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        "value": "",
                        "priority": 20
                    }
                ]
            };
            break;

        case 'halt':
            effectData = {
                name: 'Command - Halt',
                icon: item.img,
                origin: item.uuid,
                flags: {
                    dae: {
                        'macroRepeat': 'startEveryTurn',
                        'specialDuration': ['turnEnd']
                    }
                },
                changes: [
                    {
                        "key": "macro.itemMacro",
                        "mode": CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        "value": "",
                        "priority": 20
                    }
                ]
            };
            break;
    }

    if (effectData) {
        await MidiQOL.socket().executeAsGM('createEffects', {'actorUuid': actor.uuid, 'effects': [effectData]});
    }
}
