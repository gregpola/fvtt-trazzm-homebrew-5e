/*
    The target must succeed on a Strength saving throw or drop one object of your choice that it's holding, with the object landing in its space.
*/
const optionName = "Disarming Attack";
const version = "13.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        for (let targetToken of workflow.failedSaves) {
            // check for potential dropped items
            let possibleItems = targetToken.actor.items.filter(i => i.system.equipped &&
                ((i.type === 'weapon' && i.system.type.value !== 'natural' ) ||
                    i.system.type.value.toLowerCase() === 'trinket' ||
                    i.system.type.value.toLowerCase() === 'wand' ||
                    i.system.type.value.toLowerCase() === 'potion' ));

            if (possibleItems) {
                let droppedItem;
                if (possibleItems.length === 1) {
                    droppedItem = possibleItems[0];
                }
                else {
                    // ask which item to drop
                    let itemList = await possibleItems.reduce((list, item) => list += `<option value="${item.id}">${item.name}</option>`, ``);

                    droppedItem = await foundry.applications.api.DialogV2.prompt({
                        content: `<p>Which item do you want ${targetToken.name} to drop?</p><form><div class="form-group"><select id="dropItem">${itemList}</select></div></form>`,
                        rejectClose: false,
                        ok: {
                            callback: (event, button, dialog) => {
                                const itemId = button.form.elements.dropItem.value;
                                if (itemId) {
                                    return targetToken.actor.items.find(i => i.id === itemId);
                                }
                                return undefined;
                            }
                        },
                        window: {
                            title: `${optionName}`,
                        },
                        position: {
                            width: 400
                        }
                    });
                }

                if (droppedItem) {
                    await game.itempiles.API.createItemPile({
                        enabled: true,
                        deleteWhenEmpty: true,
                        position: {
                            x: targetToken.x + canvas.grid.size,
                            y: targetToken.y
                        },
                        itemPileFlags: {
                            enabled: true,
                            deleteWhenEmpty: true
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

                    await game.itempiles.API.removeItems(targetToken.actor, [{ item: droppedItem, quantity: 1 }]);
                    ChatMessage.create({
                        content: `${targetToken.name} drops ${droppedItem.name} to the ground`,
                        speaker: ChatMessage.getSpeaker({actor: targetToken.actor})
                    });
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
