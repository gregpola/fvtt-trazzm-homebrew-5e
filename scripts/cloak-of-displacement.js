const lastArg = args[args.length - 1];
let tactor;
if (lastArg.tokenId) tactor = canvas.tokens.get(lastArg.tokenId).actor;
else tactor = game.actors.get(lastArg.actorId);
const version = Math.floor(game.version);
let gameRound = game.combat ? game.combat.round : 0;
const itemD = lastArg.efData.flags.dae.itemData;
const itemOrigin = duplicate(lastArg.origin);
const effectName = `${itemD.name} Effect`;

if (args[0] === "each" || "on") {
    let effectData = [{
        label: effectName,
        icon: itemD.img,
        origin: itemOrigin,
        transfer: false,
        disabled: false,
        duration: { startRound: gameRound, startTime: game.time.worldTime },
        flags: { dae: { specialDuration: ["isDamaged"] } },
        changes: [
            { key: `flags.midi-qol.grants.disadvantage.attack.all`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: 1, priority: 20 }
        ]
    }];
    let effect = tactor.effects.find(i => (version > 9 ? i.label : i.data.label) === effectName);
    if (!effect) await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tactor.uuid, effects: effectData });
}

if (args[0] === "off") {
    let effect = tactor.effects.find(i => (version > 9 ? i.label : i.data.label) === effectName);
    if (effect) await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: tactor.uuid, effects: [effect.id] });
}
