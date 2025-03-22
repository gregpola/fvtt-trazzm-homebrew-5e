// Turn End Macro
// token is the target token
// actor is the target actor
// origin is the sphere item
const sourceActor = origin.parent;
const sourceToken = origin.parent.token;
const theItem = await sourceActor.items.getName(origin.name);
await MidiQOL.completeItemUse(theItem, {}, {targetUuids: [token.document.uuid]});
