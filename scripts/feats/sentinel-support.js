const version = "11.0";
const optionName = "Sentinel";

// On Attack Rolls effect macro
console.log("Sentinel - Reprisal Attack - On Attack Rolls");

// make sure the sentinel actor has their reaction available
if (MidiQOL.hasUsedReaction(origin.parent)) {
    console.log(`${optionName} - sentinel actor has already used their reaction`);
    return;
}

// Get the target and make sure they don't also have Sentinel
let targetToken = undefined;
let allTargets = game.user?.targets ??  new Set();
let attackTargets = allTargets?.filter(tk => tk.actor).filter(tk => MidiQOL.isTargetable(tk)) ?? new Set();
if (attackTargets.size > 0) {
    targetToken = attackTargets.first();
}
if (!targetToken) {
    console.log(`${optionName} - no attack target`);
    return;
}

if (targetToken.actor.items.find(i => i.name.toLowerCase() === "sentinel")) {
    console.error(`${optionName} - target has Sentinel`);
    return;
}

// make sure the sentinel actor has an appropriate weapon equipped
let validWeapons = origin.parent.items.filter(item => {
    return (item.system.actionType === "mwak" && item.system.equipped === true);
});
if (!validWeapons.length) {
    console.log(`${optionName} - sentinel actor has no appropriate weapon equipped`);
    return;
}

// Give the Sentinel player the option of attacking
let optionData = validWeapons.map(item => `<option value="${item.uuid}">${item.name}</option>`).join("");
let dialogContent = `
    <div style='display: flex; align-items: center; justify-content: space-between;'>
        <div style='flex: 1;'>
            <p>${token.name} is attacking ${targetToken.name}</p>
            <p>Would you like to use your reaction to attack?</p>
            <p>Choose your Weapon: <select id='item-select'>${optionData}</select></p>
        </div>
        <div style='border-left: 1px solid #ccc; padding-left: 10px; text-align: center;'>
            <p><b>Time remaining</b></p>
            <p><span id='countdown' style='font-size: 16px; color: red;'>30</span> seconds</p>
        </div>
    </div>`;

// Assign player actor for socket, default to GM if no player active for the actor
let browserUser = MidiQOL.playerForActor(origin.parent);
if (!browserUser?.active) {
    console.info(`${optionName} - unable to locate the actor player, sending to GM`);
    browserUser = game.users?.activeGM;
}

// Create temporary item for dialog
const timeLeft = 30; //Change dialog timeout here, value is in seconds
const tempItemData = {
    "name": optionName,
    "type": "feat",
    "img": "icons/magic/symbols/runes-etched-steel-blade.webp",
    "effects": [{
        "icon": "icons/magic/symbols/runes-etched-steel-blade.webp",
        "name": "Sentinel Reaction",
        "changes": [],
        "origin": origin.uuid,
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
                                    title: "Sentinel Reprisal Attack",
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
let tempItem = await Item.create(tempItemData, { parent: origin.parent });

// Trigger the dialog for the specific player
await MidiQOL.socket().executeAsUser("completeItemUse", browserUser.id,
    { itemData: tempItem, actorUuid: origin.parent.uuid});

// remove the temporary item
await origin.parent.deleteEmbeddedDocuments("Item", [tempItem.id]);
