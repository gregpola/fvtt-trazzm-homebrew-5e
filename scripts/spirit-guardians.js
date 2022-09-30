const lastArg = args[args.length -1];
// Check when applying the effect - if the token is not the caster and it IS the tokens turn they take damage
if (args[0] === "on" && args[1] !== lastArg.tokenId && lastArg.tokenId === game.combat?.current.tokenId) {
    const sourceItem = await fromUuid(lastArg.origin);
    let theActor = await fromUuid(lastArg.actorUuid);
    if (theActor.actor) theActor = theActor.actor;
    const itemData = mergeObject(duplicate(sourceItem.data), {
        type: "weapon",
        effects: [],
        flags: {
            "midi-qol": {
                noProvokeReaction: true, // no reactions triggered
                onUseMacroName: null // 
            },
        },
        data: {
            actionType: "save",
            save: {dc: Number.parseInt(args[3]), ability: "wis", scaling: "flat"},
            damage: { parts: [[`${args[2]}d8`, "radiant"]] },
            "target.type": "self",
            components: {concentration: false, material: false, ritual: false, somatic: false, value: "", vocal: false},
            duration: {units: "inst", value: undefined},
            weaponType: "improv"
        }
    }, {overwrite: true, inlace: true, insertKeys: true, insertValues: true});
    itemData.data.target.type = "self";
    setProperty(itemData.flags, "autoanimations.killAnim", true);
    itemData.flags.autoanimations.killAnim = true;;
    const item = new CONFIG.Item.documentClass(itemData, { parent: theActor })
    const options = { showFullCard: false, createWorkflow: true, versatile: false, configureDialog: false };
    await MidiQOL.completeItemRoll(item, options);
}
