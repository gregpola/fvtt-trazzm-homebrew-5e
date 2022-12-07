const getMessage = game.messages.contents.filter(mes=>mes.data.content.includes("<div class=\"dnd5e chat-card item-card midi-qol-item-card\"")).pop(); //at(-1) for Zhell
const itemUuid = getMessage.data.flags['midi-qol'].itemUuid;
const item = await fromUuid(itemUuid);
if (item.getRollData().item.actionType === "mwak" && getMessage.data.flags['midi-qol'].isCritical) {
    setProperty(this,'isCritical',true)
}