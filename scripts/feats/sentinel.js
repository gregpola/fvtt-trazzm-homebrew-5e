/*
    You have mastered techniques to take advantage of every drop in any enemy's guard, gaining the following benefits:

        * When you hit a creature with an opportunity attack, the creature's speed becomes 0 for the rest of the turn.
        * Creatures provoke opportunity attacks from you even if they take the Disengage action before leaving your reach.
        * When a creature within 5 feet of you makes an attack against a target other than you (and that target doesn't
            have this feat), you can use your reaction to make a melee weapon attack against the attacking creature.
*/
const version = "11.0";
const optionName = "Sentinel";

try {
    if (args[0].macroPass === "postAttackRoll") {
        const targetToken = workflow.targets.first();

        // get the sentinel actor token
        let sentinelToken = await MidiQOL.tokenForActor(macroItem.parent);
        if (!sentinelToken) {
            console.error(`${optionName} - sentinelToken not found`);
            return;
        }

        // make sure the sentinel actor has their reaction available
        if (MidiQOL.hasUsedReaction(sentinelToken.actor)) {
            console.error(`${optionName} - sentinelToken has already used their reaction`);
            return;
        }

        // Check if same disposition tokens
        if (token.document.disposition === sentinelToken.document.disposition) {
            console.error(`${optionName} - sentinelToken is allied with the attacker`);
            return;
        }

        // Check if origin token is the one attacked
        if (sentinelToken.id === targetToken.id) {
            console.error(`${optionName} - sentinelToken is being attacked`);
            return;
        }

        // Check if target also has sentinel
        if (targetToken.actor.items.find(i => i.name.toLowerCase() === "sentinel")) {
            console.error(`${optionName} - target has Sentinel`);
            return;
        }

        // make sure the sentinel actor has an appropriate weapon equipped
        let validWeapons = sentinelToken.actor.items.filter(item => {
            return (item.system.actionType === "mwak" && item.system.equipped === true);
        });
        if (!validWeapons.length) {
            console.error(`${optionName} - sentinelToken has no appropriate weapon equipped`);
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
        let browserUser = MidiQOL.playerForActor(sentinelToken.actor);
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
                "origin": sentinelToken.actor.uuid,
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
        let tempItem = await Item.create(tempItemData, { parent: sentinelToken.actor });

        // Trigger the dialog for the specific player
        await MidiQOL.socket().executeAsUser("completeItemUse", browserUser.id, {
            itemData: tempItem,
            actorUuid: sentinelToken.actor.uuid});

        await sentinelToken.actor.deleteEmbeddedDocuments("Item", [tempItem.id]);
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
