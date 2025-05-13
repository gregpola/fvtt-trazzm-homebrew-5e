/*
    If you hit a creature with a melee attack roll using this weapon, you can make a melee attack roll with the weapon
    against a second creature within 5 feet of the first that is also within your reach. On a hit, the second creature
    takes the weapon’s damage, but don’t add your ability modifier to that damage unless that modifier is negative. You
    can make this extra attack only once per turn.
*/
const optionName = "Weapon Mastery: Cleave";
const version = "12.4.0";
const _flagName = "mastery-cleave-used";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postActiveEffects") {
        let targetToken = workflow.hitTargets.first();
        if (targetToken && item.type === 'weapon' && item.system.mastery === 'cleave' && HomebrewHelpers.hasMastery(actor, item)) {
            if (HomebrewHelpers.perTurnCheck(actor, _flagName, 'tokenTurn')) {
                // check for eligible targets
                const nearTarget = MidiQOL.findNearby([CONST.TOKEN_DISPOSITIONS.FRIENDLY, CONST.TOKEN_DISPOSITIONS.NEUTRAL], targetToken, 5, {canSee: true});
                if (nearTarget !== null && nearTarget.length > 0) {
                    const maxRange = Math.max(Number(item.system.range.value), item.system.range.reach);
                    const withinRange = MidiQOL.findNearby(null, token, maxRange, {canSee: true});

                    const potentialTargets = withinRange.filter(value => nearTarget.includes(value));
                    if (potentialTargets !== null && potentialTargets.length > 0) {
                        // ask which target to attack, if any
                        let target_content = ``;
                        for (let t of potentialTargets) {
                            target_content += `<option value=${t.id}>${t.name}</option>`;
                        }

                        let content = `
							<p><label>Select the target to attack with Cleave or close the dialog to pass:</label></p>
							<p><select name="targets">${target_content}</select></p>`;

                        let targetId = await foundry.applications.api.DialogV2.prompt({
                            content: content,
                            rejectClose: false,
                            ok: {
                                callback: (event, button, dialog) => {
                                    return button.form.elements.targets.value
                                }
                            },
                            window: {
                                title: `${optionName}`,
                            },
                            position: {
                                width: 400
                            }
                        });

                        if (targetId) {
                            let newTarget = canvas.tokens.get(targetId);
                            if (newTarget) {
                                let mod = actor.system.abilities[item.system.ability].mod;
                                let bonusValue = mod > 0 ? '-@mod' : '';

                                let itemData = item.toObject();
                                delete itemData._id;
                                let activity = itemData.system.activities[workflow.activity.id];
                                if (activity) {
                                    activity.damage.parts.push({
                                        number: null,
                                        denomination: 0,
                                        bonus: `${bonusValue}`,
                                        types: [
                                            workflow.defaultDamageType
                                        ]
                                    });

                                    let modifiedItem = new CONFIG.Item.documentClass(itemData, {parent: actor});
                                    modifiedItem.prepareData();
                                    modifiedItem.prepareFinalAttributes();
                                    let modActivity = modifiedItem.system.activities.getName(workflow.activity.name);

                                    const options = {
                                        midiOptions: {
                                            targetUuids: [newTarget.actor.uuid],
                                            noOnUseMacro: true,
                                            configureDialog: false,
                                            showFullCard: false,
                                            ignoreUserTargets: true,
                                            checkGMStatus: true,
                                            autoRollAttack: true,
                                            autoRollDamage: "always",
                                            fastForwardAttack: true,
                                            fastForwardDamage: true,
                                            workflowData: true
                                        }
                                    };

                                    await MidiQOL.completeActivityUse(modActivity, options, {}, {});

                                    // Set feature used this turn
                                    await HomebrewHelpers.setTurnCheck(actor, _flagName);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
