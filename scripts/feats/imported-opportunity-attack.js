// Function to handle the attack logic and present dialog to player
async function handleAttack(token, dialogTitle, effectOriginToken, target) {
    // Check if reaction is already used
    if(effectOriginToken.actor.effects.find(i => i.name.toLowerCase() === "reaction")) return;

    // Check if same disposition tokens
    if(token.document.disposition === effectOriginToken.document.disposition) return;

    //Check if origin token is the one attacked
    if(effectOriginToken.id === workflow.targets.first().id) return;

    //Check if target also has sentinel
    if(target.actor.items.find(i => i.name.toLowerCase() === "sentinel")) return;

    // Check valid weapons
    let validWeapons = effectOriginToken.actor.items.filter(item => {
        return (item.system.actionType === "mwak" && item.system.equipped === true);
    });
    if (!validWeapons.length) return;
    // Find 'Unarmed Strike' from the validWeapons array and add to end of list
    const unarmedIndex = validWeapons.findIndex(item => item.name.toLowerCase() === "unarmed strike");
    let unarmedStrike;
    if (unarmedIndex > -1) {
        unarmedStrike = validWeapons.splice(unarmedIndex, 1)[0];
        validWeapons.push(unarmedStrike);
    }

    let optionData = validWeapons.map(item => `<option value="${item.uuid}">${item.name}</option>`).join("");
    let dialogContent = `
        <div style='display: flex; align-items: center; justify-content: space-between;'>
            <div style='flex: 1;'>
                Would you like to use your reaction to attack?<br/><br/>
                Choose your Weapon: <select id='item-select'>${optionData}</select>
            </div>
            <div style='border-left: 1px solid #ccc; padding-left: 10px; text-align: center;'>
                <p><b>Time remaining</b></p>
                <p><span id='countdown' style='font-size: 16px; color: red;'>15</span> seconds</p>
            </div>
        </div>`;

    // Assign player actor for socket, default to GM if no player active for the actor
    let browserUser = MidiQOL.playerForActor(effectOriginToken.actor);
    if (!browserUser?.active) {
        browserUser = game.users?.activeGM;
    }

    const timeLeft = 15; //Change dialog timeout here, value is in seconds

// Create temporary item for dialog
    const tempItemData = {
        "name": "Sentinel Reaction",
        "type": "feat",
        "img": "icons/magic/symbols/runes-etched-steel-blade.webp",
        "effects": [{
            "icon": "icons/magic/symbols/runes-etched-steel-blade.webp",
            "name": "Sentinel Reaction",
            "changes": [],
            "origin": effectOriginToken.actor.uuid,
            "disabled": false,
            "duration": {
                "rounds": 1
            },
            "flags": {
                "dae": {
                    "macroRepeat": "none"
                },
                "effectmacro": {
                    "onCreate": {
                        "script": `
                        let dialog = new Dialog({
                            title: "${dialogTitle}",
                            content: \`${dialogContent}\`,
                            buttons: {
                                yes: {
                                    label: "Yes",
                                    callback: async (html) => {
                                        // Logic for yes response
                                        let selectedItemUuid = html.find("#item-select").val();
                                        if (!selectedItemUuid) {
                                            console.log("No weapon selected");
                                            return;
                                        }

                                        let chosenWeapon = await fromUuid(selectedItemUuid);
                                        chosenWeapon.prepareData();
                                        chosenWeapon.prepareFinalAttributes();

                                        const options = {
                                            showFullCard: false,
                                            createWorkflow: true,
                                            versatile: false,
                                            configureDialog: false,
                                            targetUuids: [\`${token.document.uuid}\`],
                                            workflowOptions: {
                                                autoRollDamage: 'onHit',
                                                autoFastDamage: true
                                            }
                                        };
                                        const attackRoll = await MidiQOL.completeItemUse(chosenWeapon, {}, options);
                                        if(attackRoll) {
                                        const uuid = actor.uuid;
										const hasEffectApplied = await game.dfreds.effectInterface.hasEffectApplied('Reaction', uuid);

										if (!hasEffectApplied) {
										  await game.dfreds.effectInterface.addEffect({ effectName: 'Reaction', uuid });
										}
                                        }
                                    }
                                },
                                no: {
                                    label: "No",
                                    callback: () => {
                                        console.log("Reaction declined");
                                    }
                                },
                            }, default: "no",
                                render: (html) => { let timeLeft = ${timeLeft}; const countdownElement = html.find("#countdown"); const timer = setInterval(() => { timeLeft--; countdownElement.text(timeLeft); if (timeLeft <= 0) { clearInterval(timer); dialog.close(); } }, 1000); setTimeout(() => { clearInterval(timer); if (timeLeft > 0) dialog.close(); }, timeLeft * 1000); } }); dialog.render(true);
                    `
                    }
                }
            }
        }]
    };

    // Create the item on the actor and execute the effect
    let tempItem = await Item.create(tempItemData, { parent: effectOriginToken.actor });

    // Trigger the dialog for the specific player
    await MidiQOL.socket().executeAsUser("completeItemUse", browserUser.id, {
        itemData: tempItem,
        actorUuid: effectOriginToken.actor.uuid});

    await effectOriginToken.actor.deleteEmbeddedDocuments("Item", [tempItem.id]);

}

async function handleTemplate() {
    const template = await fromUuidSync(args[0].templateUuid);
    const templateExists = await actor.getFlag("midi-qol", "opportunityAttackTemplate");
    if (templateExists && templateExists !== template.uuid) return template.delete();
    const hasSentinel = actor.items.find(i => i.name.toLowerCase() === "sentinel");
    const effectData = actor.effects.find(i => i.name.toLowerCase() === "opportunity attack - sentinel");
    let hasWarCaster = actor.items.find(i => i.name.toLowerCase() === "war caster");
    let validWeapons = actor.items.filter(item =>
        (item.system.actionType === "mwak" && item.system.equipped === true) ||
        (hasWarCaster && item.system.actionType === "msak" &&
            (item.system.preparation.prepared === true || item.system.preparation.mode !== 'prepared' || !item.system.preparation))
    );

    if (!validWeapons.length) {
        ui.notifications.warn(`No Valid Melee options found, cancelling Opportunity Attack options for ${actor.name}`);
        return template.delete();
    }

    const isPc = token.actor.type === 'character';

    if (isPc) {
        await new Dialog({
            title: "Opportunity Attack Option",
            content: `<p>${token.actor.name} would you like to use automated Opportunity Attacks?</p>`,
            buttons: {
                yes: {
                    label: "Yes",
                    callback: async (html) => {
                        if(hasSentinel && effectData) {
                            await effectData.update({"disabled": false});
                        }
                    }
                },
                no: {
                    label: "No",
                    callback: async (html) => {
                        return template.delete();
                    },
                }
            },
            default: "No"
        }).render(true);
    } else {
        if (effectData && hasSentinel) {
            await effectData.update({"disabled": false});
        }
    }

    let onlyThrownWeapons = validWeapons.length > 0 && validWeapons.every(item => 'thr' in item.system.properties && item.system.properties.has('thr'));
    let maxRange;

    if (onlyThrownWeapons) {
        // Set maxRange to 5 if only thrown weapons are available
        maxRange = 5;
    } else {
        maxRange = validWeapons.reduce((max, item) => {
            let rangeValue = item.system.range?.value;
            if (rangeValue && !isNaN(rangeValue) && (!item.system.properties?.thr)) {
                return Math.max(max, rangeValue);
            }
            return max;
        }, 0);
    }

    if (game.settings.get("dnd5e", "diagonalMovement") === "555" && canvas.scene.grid.type === 1 && maxRange === 10) {
        maxRange = maxRange + 2.1;
    }

    //Hacky workaround to get correct distance
    if(token.document.width === 1) maxRange = maxRange + 2.1;
    if(token.document.width === 2) maxRange = maxRange + 4.1;
    if(token.document.width === 3) maxRange = maxRange + 6.1;
    if(token.document.width === 4) maxRange = maxRange + 8.1;

    await template.update({
        "distance": maxRange
    });

    await tokenAttacher.attachElementsToToken([template], token, false);
    await actor.setFlag("midi-qol", "opportunityAttackTemplate", template.uuid);
}

async function main() {
    if (args[0].macroPass === "postAttackRoll") {
        // Check if the target was hit. If so, wait for postDamageRoll
        if (workflow.hitTargets && workflow.hitTargets.first()) {
            console.log("Target was hit, waiting for postDamageRoll.");
            return;
        }
    }

    if (args[0].macroPass === "postAttackRoll" || args[0].macroPass === "postDamageRoll") {
        let dialogTitle = "Sentinel Attack";

        await handleAttack(
            token,
            dialogTitle,
            await MidiQOL.tokenForActor(macroItem.parent),
            workflow.targets.first()
        );
    }
    if (args[0].macroPass === "templatePlaced") {
        await handleTemplate();
    }
}

main();



////////////////////// Effect Macros //////////////////////////////////////////////

// On Combat Starting
await actor.items.getName("Opportunity Attack").use();

// On Combat Ending
let templateUuid = await actor.getFlag("midi-qol", "opportunityAttackTemplate");
if(!templateUuid) return;
let templateData = await fromUuid(templateUuid);
templateData.delete();

// On Combat Mark Defeated
let templateUuid = await actor.getFlag("midi-qol", "opportunityAttackTemplate");
if(!templateUuid) return;
let templateData = await fromUuid(templateUuid);
templateData.delete();


////////////////////// Template Macros //////////////////////////////////////////////

// When Deleted
////////////////////////////////////////////////

const effectOriginActor = await fromUuid(template.flags["midi-qol"].actorUuid);
const templateExists = await effectOriginActor.getFlag("midi-qol", "opportunityAttackTemplate");
if (templateExists && templateExists !== template.uuid) return;
await effectOriginActor.unsetFlag("midi-qol", "opportunityAttackTemplate");


// When Entered
////////////////////////////////////////////////

if(this.hook.animate === false) return;

let currentCombatant = canvas.tokens.get(game.combat.current.tokenId);
if (currentCombatant.id !== token.id && currentCombatant.document.disposition === token.document.disposition) return; //Avoid initiating opportunity attack when it's not a tokens turn if they are doing something like riding another allied token. This should allow for dialog to fire if forced movement via an enemy spell moves the token outside range outside of their turn but not when being moved as part of an allied unit

const effectOriginActor = await fromUuid(template.flags["midi-qol"].actorUuid);
let effectOriginToken = await MidiQOL.tokenForActor(effectOriginActor.uuid);

let hasPolearmReaction = effectOriginActor.items.find(i => i.name.toLowerCase() === "polearm master");
if (!hasPolearmReaction) return;
let weaponNames = ["glaive","halberd","pike","quarterstaff","spear"];
let hasPolearmWeapon = effectOriginActor.items.some(item => weaponNames.includes(item.name.toLowerCase()) && item.system.equipped === true);
if(!hasPolearmWeapon) return;

await template.callMacro("never", { dialogTitle: "Polearm Opportunity Attack", effectOriginToken, effectOriginActor, token });

// When Left
////////////////////////////////////////////////

if (this.hook.animate === false) return;

let currentCombatant = canvas.tokens.get(game.combat.current.tokenId);
if (currentCombatant.id !== token.id && currentCombatant.document.disposition === token.document.disposition) return; // Avoid initiating opportunity attack when it's not a token's turn if they are doing something like riding another allied token. This should allow for dialog to fire if forced movement via an enemy spell moves the token outside range outside of their turn but not when being moved as part of an allied unit

const effectOriginActor = await fromUuid(template.flags["midi-qol"].actorUuid);
let effectOriginToken = await MidiQOL.tokenForActor(effectOriginActor.uuid);

await template.callMacro("never", { dialogTitle: "Opportunity Attack", effectOriginToken, effectOriginActor, token });

// When Through
////////////////////////////////////////////////

if (this.hook.animate === false) return;

let currentCombatant = canvas.tokens.get(game.combat.current.tokenId);
if (currentCombatant.id !== token.id && currentCombatant.document.disposition === token.document.disposition) return; // Avoid initiating opportunity attack when it's not a token's turn if they are doing something like riding another allied token. This should allow for dialog to fire if forced movement via an enemy spell moves the token outside range outside of their turn but not when being moved as part of an allied unit
console.log(template)
const effectOriginActor = await fromUuid(template.flags["midi-qol"].actorUuid);
let effectOriginToken = await MidiQOL.tokenForActor(effectOriginActor.uuid);

await template.callMacro("never", { dialogTitle: "Opportunity Attack", effectOriginToken, effectOriginActor, token });

// Never Automatically
////////////////////////////////////////////////

let { dialogTitle,effectOriginToken,effectOriginActor,token } = this;

let hasSentinel = effectOriginActor.items.find(i => i.name.toLowerCase() === "sentinel");

// Check if same disposition token
if(token.document.disposition === effectOriginToken.document.disposition) return;

// Check if reaction is already used
let reactionUsed = effectOriginActor.effects.find(i => i.name.toLowerCase() === "reaction");
if (reactionUsed) return;

//Check if token is disengaged and no Sentinel
let isDisengaged = token.actor.effects.find(e => e.name.toLowerCase() === "disengage");
if(isDisengaged && !hasSentinel) return;

// Check valid weapons, including spells if War Caster is present
let hasWarCaster = effectOriginActor.items.find(i => i.name.toLowerCase() === "war caster");

let validWeapons = effectOriginActor.items.filter(item => {
    return ((item.system.actionType === "mwak" && item.system.equipped === true) || (hasWarCaster && item.system.actionType === "msak" && (item.system.preparation.prepared === true || item.system.preparation.mode !== 'prepared')));
});
if (!validWeapons.length) return;

// Find 'Unarmed Strike' from the validWeapons array and add to end of list
const unarmedIndex = validWeapons.findIndex(item => item.name.toLowerCase() === "unarmed strike");
let unarmedStrike;
if (unarmedIndex > -1) {
    unarmedStrike = validWeapons.splice(unarmedIndex, 1)[0];
    validWeapons.push(unarmedStrike);
}

let optionData = validWeapons.map(item => `<option value="${item.uuid}">${item.name}</option>`).join("");
let dialogContent = `
	<div style='display: flex; align-items: center; justify-content: space-between;'>
		<div style='flex: 1;'>
			Would you like to use your reaction to attack?<br/><br/>
			Choose your Weapon: <select id='item-select'>${optionData}</select>
		</div>
		<div style='border-left: 1px solid #ccc; padding-left: 10px; text-align: center;'>
			<p><b>Time remaining</b></p>
			<p><span id='countdown' style='font-size: 16px; color: red;'>15</span> seconds</p>
		</div>
	</div>`;

// Assign player actor for socket, default to GM if no player active for the actor
let browserUser = MidiQOL.playerForActor(effectOriginActor);
if (!browserUser?.active) {
    browserUser = game.users?.activeGM;
}

const timeLeft = 15; //Change dialog timeout here, value is in seconds

// Let Active Auras recover
async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
await wait(100);

// Create temporary item for dialog
const tempEffectData = [{
    "icon": "icons/weapons/swords/sword-guard-flanged-purple.webp",
    "name": "Opportunity Attack Reaction",
    "changes": [],
    "origin": effectOriginActor.uuid,
    "disabled": false,
    "duration": {
        "rounds": 1
    },
    "flags": {
        "dae": {
            "macroRepeat": "none"
        },
        "effectmacro": {
            "onCreate": {
                "script": `
                        let dialog = new Dialog({
                            title: "${dialogTitle}",
                            content: \`${dialogContent}\`,
                            buttons: {
                                yes: {
                                    label: "Yes",
                                    callback: async (html) => {
                                        // Logic for yes response
                                        let selectedItemUuid = html.find("#item-select").val();
                                        if (!selectedItemUuid) {
                                            console.log("No weapon selected");
                                            return;
                                        }

                                        let chosenWeapon = await fromUuid(selectedItemUuid);
                                            chosenWeapon = chosenWeapon.clone({
                                                system: {
                                                    "range": {
                                                        "value": null,
                                                        "long": null,
                                                        "units": ""
                                                    }
                                                }
                                            }, { keepId: true });
                                        chosenWeapon.prepareData();
                                        chosenWeapon.prepareFinalAttributes();

                                        const options = {
                                            showFullCard: false,
                                            createWorkflow: true,
                                            versatile: false,
                                            configureDialog: false,
                                            targetUuids: [\`${token.document.uuid}\`],
                                            workflowOptions: {
                                                autoRollDamage: 'onHit',
                                                autoFastDamage: true
                                            }
                                        };
                                        const attackRoll = await MidiQOL.completeItemUse(chosenWeapon, {}, options);
										const uuid = actor.uuid;
										const hasEffectApplied = await game.dfreds.effectInterface.hasEffectApplied('Reaction', uuid);
										if (!hasEffectApplied) {
										  await game.dfreds.effectInterface.addEffect({ effectName: 'Reaction', uuid });
										}
                                    }
                                },
                                no: {
                                    label: "No",
                                    callback: async () => {
                                    }
                                },
                            }, default: "no",
                                render: (html) => { let timeLeft = ${timeLeft}; const countdownElement = html.find("#countdown"); const timer = setInterval(() => { timeLeft--; countdownElement.text(timeLeft); if (timeLeft <= 0) { clearInterval(timer); dialog.close(); } }, 1000); setTimeout(() => { clearInterval(timer); if (timeLeft > 0) dialog.close(); }, timeLeft * 1000); } }); dialog.render(true);
                    `
            }
        }
    }
}];

await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: effectOriginActor.uuid, effects: tempEffectData });
const tempEffect = effectOriginActor.effects.getName("Opportunity Attack Reaction");
await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: effectOriginActor.uuid, effects: [tempEffect.id] });
