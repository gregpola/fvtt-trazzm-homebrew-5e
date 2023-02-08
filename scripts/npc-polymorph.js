/**********
 * Requires Warp Gate v1.15.0 or higher
 *
 * Proof of concept script for system agnostic polymorphing/transforming. Intended for use
 * with dnd5e, but can be modified to suit your system.
 *
 * Note: This script was written with the dnd5e system in mind and utilizes some
 * of its properties as a shortcut (such as not changing actor types).
 *
 * Source: https://ko-fi.com/post/Powermorph-Phase-3-Transform-ALL-the-Things-Z8Z67WTTM
 */

/* Collect all actor names in the world */
const names = game.actors.map( actor => actor.name )

/* Prompt for target form */
const results = await warpgate.menu({inputs: [{type: 'select', label: 'Choose target form', options: names}]}, {title: 'Powermorph (alpha)'});

/* if cancelled, bail */
if(!results.buttons) return;

/* get desired actor */
const targetActor = game.actors.getName(results.inputs[0]);

/* if we couldnt find the actor (weird), bail */
if(!targetActor) return;

/* get the full actor data */
const actorUpdates = targetActor.toObject();

/* proto token data isnt needed */
delete actorUpdates.token;

/* we will handle the items ourselves */
delete actorUpdates.items;

/* just ignoring active effects entirely */
delete actorUpdates.effects;

/**
 * dnd5e: npc and character are nearly interchangable.
 * If we dont switch the type, we dont have to fool
 * with the sheet app caching.
 */
delete actorUpdates.type;

const tokenUpdates = (await targetActor.getTokenDocument({x: token.document.x, y: token.document.y})).toObject();

/* Protects the actor a bit more, but requires you 
 * to close and repon the sheet after reverting.
 */
//tokenUpdates.actorLink = false; //protects the actor a bit more,
                                  //but requires you to close/reopon
                                  //the sheet after revert

/* leave the actor link unchanged for a more seamless mutation */                                 
delete tokenUpdates.actorLink;

/* we want to keep our source actor, not swap to a new one entirely */
delete tokenUpdates.actorId;

/* grab the item data from the new actor and flag it for later */
const newItems = targetActor.getEmbeddedCollection('Item').reduce( (acc, element) => { 
    acc[element.id] = element.toObject();
    setProperty(acc[element.id], 'flags.warpgate.powerMorph.delete', true);
    return acc;
}, {});

/* mark all of our items for delete */
const itemUpdates = token.actor.items.reduce( (acc, val) => {
    acc[val.id] = warpgate.CONST.DELETE;
    return acc;
}, newItems)

console.log({token: tokenUpdates, actor: actorUpdates, items: itemUpdates});

const mutationName = `Mutated into ${targetActor.name}`

/* Perform the mutation */
await warpgate.mutate(token.document,
    {token: tokenUpdates, actor: actorUpdates, embedded: {Item: itemUpdates}},
    {},
    {name: mutationName, comparisonKeys: {Item: 'id'}, updateOpts: {embedded: {Item: {renderSheet: false}}}}
);

/* We need to modify mutation stack to removed added items 
 * since we didn't know their IDs prior to creation
 */

/* get our revert data */
let mutationStack = warpgate.mutationStack(token.document);
let powerMorphStack = mutationStack.getName(mutationName);

/* trim out delete keys for old IDs as they no longer exist */
powerMorphStack.delta.embedded.Item = Object.values(powerMorphStack.delta.embedded.Item).reduce( (acc, val) => {
    if (val !== warpgate.CONST.DELETE) {
        acc[val._id] = val;
    }
    return acc;
}, {})

/* add in deletes for items that we added via powerMorph */
token.document.actor.items.forEach( (item) => {
    if (getProperty(item, 'flags.warpgate.powerMorph.delete')){
        powerMorphStack.delta.embedded.Item[item.id] = warpgate.CONST.DELETE;
    }
} );

console.log(powerMorphStack)

/* update the data and commit the change */
mutationStack.update(powerMorphStack.name, powerMorphStack, {overwrite: true})
await mutationStack.commit();