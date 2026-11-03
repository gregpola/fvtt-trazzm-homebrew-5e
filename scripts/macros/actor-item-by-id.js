const itemId = "WlaiMrPXKPiZlRQl";

for (let tok of canvas.tokens.controlled) {
    var item = tok.actor.items.find(i => i.id === itemId);
    if (item) {
        ui.notifications.info(`${tok.name} - found item '${item.name}' with id '${itemId}'`);
    }
    else {
        ui.notifications.info(`${tok.name} - no item with id '${itemId}' found`);
    }
}

