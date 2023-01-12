//##############################################################
// https://www.patreon.com/crymic
//##############################################################
const lastArg = args[args.length - 1];
const version = Math.floor(game.version);
const target = canvas.tokens.get(lastArg.targets[0]?.id);
if(!target) return ui.notifications.error(`No Target Selected!`);
const itemD = lastArg.item;
const condition_list = ["Blinded", "Deafened", "Paralyzed", "Diseased", "Poisoned"];
const effect = target.actor.effects.filter(i => condition_list.includes(version > 9 ? i.label : i.data.label));
const selectOptions = effect.reduce((list, activeE) => {
    let condition = (version > 9 ? activeE.label : activeE.data.label);
    list.push(`<option value="${condition}">${condition}</option>`);
    return list;
}, []);
if (selectOptions.length === 0) return ui.notifications.error(`Nothing happens.. There's nothing to Cure on ${target.actor.name}.`);
let the_content = `<form class="flexcol"><div class="form-group"><select id="element">${selectOptions.join('')}</select></div></form>`;
await new Dialog({
    title: `${itemD.name} : ${target.actor.name}`,
    content: the_content,
    buttons: {
        yes: {
            icon: '<i class="fas fa-check"></i>',
            label: 'Remove it!',
            callback: async (html) => {
                let element = html.find('#element').val();
                let chatMessage = game.messages.get(lastArg.itemCardId);
                let chatContent = `<div class="midi-qol-nobox"><div class="midi-qol-flex-container"><div>Cures ${element}:</div><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}"> ${target.actor.name}</div><div><img src="${version > 9 ? target.texture.src : target.data.img}" width="30" height="30" style="border:0px"></img></div></div></div>`;
                let content = duplicate(version > 9 ? chatMessage.content : chatMessage.data.content);
                let searchString = /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
                let replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${chatContent}`;
                content = content.replace(searchString, replaceString);
                let choosen = target.actor.effects.find(i => (version > 9 ? i.label : i.data.label) === element);
                await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: target.actor.uuid, effects: [choosen.id] });
                await chatMessage.update({ content: content });
                await ui.chat.scrollBottom();
            }
        }
    },
    default: "yes"
}).render(true);
