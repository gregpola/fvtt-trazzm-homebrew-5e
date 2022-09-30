//#######################################
// READ FIRST!!!!!!!!!!
// DAE Macro, use either macro.execute or macro.itemmacro with @item.level
//#######################################
const lastArg = args[args.length - 1];
console.log(lastArg);
let tactor;
if (lastArg.tokenId) tactor = canvas.tokens.get(lastArg.tokenId).actor;
else tactor = game.actors.get(lastArg.actorId);
const itemD = lastArg.efData.flags.dae.itemData;
const level = Number(args[1]);
const damageDice = level > 6 ? Math.ceil(7 / 2 + 1) : Math.ceil(level / 2 + 1);
console.log(damageDice);

if (args[0] === "on") {
    let itemData = [{
        "name": itemD.name,
        "type": "weapon",
        "img": itemD.img,
        "data": {
            "description": {
                "value": "<p>A magical weapon made of Shadows.</p>",
                "chat": "",
                "unidentified": ""
            },
            "quantity": 1,
            "weight": 1,
            "equipped": true,
            "identified": true,
            "activation": {
                "type": "action",
                "cost": 1,
                "condition": ""
            },
            "range": {
                "value": 5,
                "long": null,
                "units": "ft"
            },
            "uses": {
                "value": null,
                "max": "",
                "per": ""
            },
            "actionType": "mwak",
            "damage": {
                "parts": [
                    [
                        `${damageDice}d8`,
                        "psychic"
                    ]
                ],
                "versatile": ""
            },
            "weaponType": "simpleM",
            "properties": {
                "fin": true,
                "lgt": true,
                "mgc": true,
                "thr": true
            },
            "proficient": true,
        }
    }];
    await tactor.createEmbeddedDocuments("Item", itemData);
}

if (args[0] === "off") {
    let itemz = tactor.data.items.find(i => i.name === itemD.name && i.type === "weapon");
    if (itemz) await tactor.deleteEmbeddedDocuments('Item', [itemz.id]);
}