/////////////////////////////////////////
// READ FIRST
// DAE Macro.itemmacro @token or Macro.execute "MacroName" @token
// Times Up/Macro Repeat: Start of Each Turn
////////////////////////////////////////
async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
const lastArg = args[args.length - 1];
const version = Math.floor(game.version);
let tactor;
if (lastArg.tokenId) tactor = canvas.tokens.get(lastArg.tokenId).actor;
else tactor = game.actors.get(lastArg.actorId);
const damageType = "acid";

if (args[0].tag === "OnUse") {
    if (lastArg.failedSaves.length > 0) return {};
    const conc = tactor.effects.find(i => (version > 9 ? i.label : i.data.label) === "Concentrating");
    await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: tactor.uuid, effects: [conc.id] });
} else if (args[0] === "each") {
    let tokenD = canvas.tokens.get(args[1]);
    let damageDice = `${Number(args[2]) * 2}d4[${damageType}]`;
    let itemD = lastArg.efData.flags.dae.itemData;
    if (version > 9) itemD.system.components.concentration = false;
    else itemD.data.components.concentration = false;
    let target = canvas.tokens.get(lastArg.tokenId);
    const damageRoll = await new Roll(damageDice).evaluate({ async: true });
    const damageWorkflow = await new MidiQOL.DamageOnlyWorkflow(tactor, target, damageRoll.total, damageType, [target], damageRoll, { flavor: `(${CONFIG.DND5E.damageTypes[damageType]})`, itemData: itemD, itemCardId: "new" });
    await new Dialog({
        title: itemD.name,
        content: "<p>Spend an <b>Action</b> to remove the Acid?</p>",
        buttons: {
            yes: {
                label: "Yes", callback: async () => {
                    await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: tactor.uuid, effects: [lastArg.effectId] });
                    const the_message = `<div class="midi-qol-nobox midi-qol-bigger-text"><b>Condition : Removed</b></div><hr>`;
                    const chatMessage = await game.messages.get(damageWorkflow.itemCard.id);
                    let content = await duplicate(version > 9 ? chatMessage.content : chatMessage.data.content);
                    let searchString = /<div class="midi-qol-attack-roll">[\s\S]*<div class="end-midi-qol-attack-roll">/g;
                    let replaceString = `<div class="midi-qol-attack-roll"><div class="end-midi-qol-attack-roll">${the_message}`;
                    content = await content.replace(searchString, replaceString);
                    await chatMessage.update({ content: content });
                    await ui.chat.scrollBottom();
                }
            },
            no: { label: "No", callback: () => false }
        },
        default: "Yes",
    }).render(true);
}
