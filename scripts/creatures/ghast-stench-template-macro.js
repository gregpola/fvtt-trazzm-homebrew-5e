
// Template - when created
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const itemUuid = getProperty(template, "flags.midi-qol.itemUuid");
const item = fromUuidSync(itemUuid);
const api = game.modules.get("templatemacro").api;

if (!token) token = MidiQOL.tokenForActor(item.parent);
const preSelectedTargets = [token.id];
if (!preSelectedTargets.includes(token.id)) preSelectedTargets.push(token.id)

let targets;
// find token covered by the template
const theTemplate = fromUuidSync(template.uuid);
if (game.modules.get("walledtemplates")?.active)
    targets = theTemplate.object.targetsWithinShape().map(t => t.id);
else
    targets = api.findContained(theTemplate);

targets = targets.filter(tid => !preSelectedTargets.includes(tid));
targets = targets.filter(tid => MidiQOL.isTargetable(canvas.scene.tokens.get(tid)));
await theTemplate.setFlag("midi-qol", "targets", targets);
await theTemplate.setFlag("midi-qol", "preSelectedTargets", preSelectedTargets);

// Apply effects to tokens withing the template
await theTemplate.callMacro("never", {template: theTemplate, action: "doEffects", targetsToAdd: targets, userId: game.user.id});

// Template - when moved
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const api = game.modules.get("templatemacro").api;

// wait for the movement to finish
try {
    while (template.object.x !== this.coords.current.x || template.object.y !== this.coords.current.y) {
        await new Promise(resolve => setTimeout(resolve,100));
    }
} catch(err) {}

let contained;
if (game.modules.get("walledtemplates")?.active)
    contained = template.object.targetsWithinShape().map(t => t.id);
else
    contained = api.findContained(template);

// remove immune targets from consideration
const preSelected = getProperty(template, "flags.midi-qol.preSelectedTargets") ?? [];
contained = contained.filter(tid => !preSelected.includes(tid));
contained = contained.filter(tid => MidiQOL.isTargetable(canvas.scene.tokens.get(tid)));

// find tokens added/removed from the tokens inside the template
const targets = template.getFlag("midi-qol", "targets")
const targetsToRemove = targets.filter(tid => !contained.includes(tid));
const targetsToAdd = contained.filter(tid => !targets.includes(tid))

// Update the effects on the added/removed targets
await template.callMacro("never", {template, action: "doEffects", targetsToRemove, targetsToAdd, userId: game.user.id});

await template.setFlag("midi-qol", "targets", contained);

// Template - when entered
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const preSelected = getProperty(template, "flags.midi-qol.preSelectedTargets") ?? [];
// Don't include immune tokens
if (preSelected.includes(token.id)) return;
if (!MidiQOL.isTargetable(token)) return;

// Check if token is inside walled templates template
if (game.modules.get("walledtemplates")?.active
    && !template.object.targetsWithinShape().map(t=>t.id).includes(token.id)) {
    console.log("entered ", token.id, "excluded")
    return;
}

let targets = await template.getFlag("midi-qol", "targets");
if (targets.includes(token.id)) return; // already included

// Add the token to targets, apply any effects and do the damage roll for the target
targets.push(token.id);
await template.callMacro("never", {template, action: "doEffects", targetsToAdd: [token.id], userId: game.user.id});

// record the targets in the template's range
await template.setFlag("midi-qol", "targets", targets);

// Template - when left
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Just in case walled templates thinks the token is still inside the template - templates can wrap around walls?
if (game.modules.get("walledtemplates")?.active
    && template.object.targetsWithinShape().map(t=>t.id).includes(token.id)) {
    return;
}

let targets = await template.getFlag("midi-qol", "targets");
if (!targets.includes(token.id)) return;

// remove the effects from the token and remove it from the targets inside the template list
await template.callMacro("never", {template, action: "doEffects", targetsToRemove: [token.id], userId: game.user.id});
targets = targets.filter(tid => tid !== token.id);
await template.setFlag("midi-qol", "targets", targets);

// Template - turn start
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const preSelected = getProperty(template, "flags.midi-qol.preSelectedTargets") ?? [];
// Don't include immune tokens
if (preSelected.includes(token.id)) return;
if (!MidiQOL.isTargetable(token)) return;

// Check if token is inside walled templates template
if (game.modules.get("walledtemplates")?.active
    && !template.object.targetsWithinShape().map(t=>t.id).includes(token.id)) {
    return;
}

// Token started their turn inside the template - punish them
await template.callMacro("never", {template, action: "doAttack", targetsToAttack: [token.id], userId: game.user.id});

// Template - Never automatically
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let { action, targetsToAdd, targetsToRemove, targetsToAttack, template } = this;
const preSelected = getProperty(template, "flags.midi-qol.preSelectedTargets") ?? [];
const theItem = await fromUuid(template.flags["midi-qol"].itemUuid);
let targetTokens;

switch (action) {
    case "doEffects":
        targetTokens = (targetsToAdd ?? [])
            .filter(tid => !preSelected.includes(tid))
            .map(id => canvas.scene.tokens.get(id))
            .filter(t => t)
        if (targetTokens?.length > 0) await DAE.doEffects(theItem, true, targetTokens, { applyAll: true, selfEffects: "none", whisper: false });
        targetTokens = (targetsToRemove ?? [])
            .filter(tid => !preSelected.includes(tid))
            .map(id => canvas.scene.tokens.get(id))
            .filter(t => t);
        if (targetTokens?.length > 0) DAE.deleteItemActiveEffects(targetTokens, theItem.uuid, [], [], false);
        break;
    case "doAttack":
        const actor = theItem.parent;
        targetTokens = targetsToAttack.map(tid => canvas.scene.tokens.get(tid));

        for(let target of targetTokens) {
            if (!target.actor.effects?.find(ef => ef.name === "ghast-stench-immunity" && ef.origin === actor.uuid)) {
                // run save
                let saveRoll = await target.actor.rollAbilitySave("con", {flavor: "Ghast Stench", damageType: "poison"});
                if (saveRoll.total < 10) {
                    const poisonedData = [{
                        name: "Ghast Stench",
                        icon: 'icons/consumables/potions/potion-jar-corked-labeled-poison-skull-green.webp',
                        origin: actor.uuid,
                        transfer: false,
                        disabled: false,
                        duration: {startTime: game.time.worldTime, seconds: 6},
                        changes: [
                            { key: `macro.CE`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: "Poisoned", priority: 20 }
                        ],
                        flags: {
                            dae: {
                                selfTarget: false,
                                stackable: "none",
                                durationExpression: "",
                                macroRepeat: "none",
                                specialDuration: ["turnStart"],
                                transfer: false
                            }
                        },
                    }];
                    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.actor.uuid, effects: poisonedData });

                }
                else {
                    const effectData = {
                        name: "ghast-stench-immunity",
                        icon: "icons/magic/nature/root-vine-caduceus-healing.webp",
                        origin: actor.uuid,
                        duration: {startTime: game.time.worldTime, seconds: 86400},
                        changes: [],
                        disabled: false
                    }
                    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.actor.uuid, effects: [effectData] });
                }
            }
        }
        break;
}

// Template - Spirit Guardians Never automatically
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let { action, targetsToAdd, targetsToRemove, targetsToAttack, template } = this;
const preSelected = getProperty(template, "flags.midi-qol.preSelectedTargets") ?? [];
const theItem = await fromUuid(template.flags["midi-qol"].itemUuid);
let targetTokens;

switch (action) {
    case "doEffects":
        targetTokens = (targetsToAdd ?? [])
            .filter(tid => !preSelected.includes(tid))
            .map(id => canvas.scene.tokens.get(id))
            .filter(t => t)
        if (targetTokens?.length > 0) await DAE.doEffects(theItem, true, targetTokens, { applyAll: true, selfEffects: "none", whisper: false });
        targetTokens = (targetsToRemove ?? [])
            .filter(tid => !preSelected.includes(tid))
            .map(id => canvas.scene.tokens.get(id))
            .filter(t => t);
        if (targetTokens?.length > 0) DAE.deleteItemActiveEffects(targetTokens, theItem.uuid, [], [], false);
        break;
    case "doAttack":
        const actor = theItem.parent;
        let damageType = "radiant";
        const alignment = actor.system.details.alignment.toLocaleLowerCase();
        if (alignment.includes("evil")) damageType = "necrotic";
        const spellLevel = template.getFlag("midi-qol", "spellLevel");

        // create an item to do the damage, use the spirit guardians item and change everything that matters
        const itemData = mergeObject(theItem.toObject(), {
            system: {
                damage: { parts: [["3d8", damageType]] },
                save: { ability: "wis", scale: "spell" },
                components: {concentration: false},
                target: {type: "creature", units: null, value: null},
                range: {units: undefined},
            }
        });
        const attackingItem = new CONFIG.Item.documentClass(itemData, { parent: theItem.parent });
        attackingItem.prepareData();
        attackingItem.prepareFinalAttributes();
        const targetUuids = targetsToAttack.map(tid => canvas.scene.tokens.get(tid).uuid);

        // specifying both the level and don't consume the spell slot causes the item to be rolled with the correct spell scaling
        await MidiQOL.completeItemUse(
            attackingItem,
            {consumeSpellSlot: false, needsConfiguration: false, consumeSpellLevel: spellLevel},
            { targetUuids, workflowOptions: {lateTargeting: "none"},
            });
        break;
}
