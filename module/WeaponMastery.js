const _tacticalMasterOptions = new Set(["push", "sap", "slow"]);

export class WeaponMastery {

    static register() {
        logger.info("%c fvtt-trazzm-homebrew-5e", "color: #D030DE", " | Registering WeaponMastery");
        WeaponMastery.hooks();
    }

    static hooks() {
        // TODO for handling changing one weapon mastery
        Hooks.on("dnd5e.preLongRest", (actor, config) => {
            if (actor.type === "group") {

            } else {

            }
        });
    }

    static getMastery(actor, item) {
        if (item.type === 'weapon' && this.hasMastery(actor, item)) {
            return item.system.mastery;
        }

        return false;
    }

    static hasMastery(actor, item) {
        if (actor && item) {
            if (actor.system.traits.weaponProf.mastery.value.has(item.system.type.baseItem)) {
                return true;
            }
            else if (item.name === 'Psychic Blade') {
                // special handling for the Soulknife's Psychic Blade
                return true;
            }
            else if (this.hasTacticalMastery(actor, item)) {
                return true;
            }
        }

        return false;
    }

    /*
        When you attack with a weapon whose mastery property you can use, you can replace that property with the Push,
        Sap, or Slow property for that attack.
     */
    static hasTacticalMastery(actor, item) {
        const tacticalMasterEffect = item.effects.find(e => e.name.startsWith('Tactical Master') && e.type === 'enchantment');
        // TODO check the source actor
        return (tacticalMasterEffect !== undefined);
    }

    // Handle the Weapon Mastery feature workflow
    static async workflow(workflow, macroItem) {
        const mastery = this.getMastery(workflow.actor, workflow.item);
        console.info(`Trazzm-homebrew WeaponMastery - mastery for: ${workflow.item.name}, is: ${mastery}`);

        if (mastery) {
            const abilityMod = (workflow.item.system.ability) ? workflow.actor.system.abilities[workflow.item.system.ability].mod : 0;
            let targetToken = workflow.hitTargets.first();

            switch (mastery) {
                case 'cleave':
                    if (workflow.macroPass === 'postActiveEffects' && workflow.item.system.actionType === "mwak" && targetToken) {
                        if (HomebrewHelpers.perTurnCheck(workflow.actor, 'mastery-cleave-used', 'tokenTurn')) {
                            // check for eligible targets
                            const nearTarget = MidiQOL.findNearby([CONST.TOKEN_DISPOSITIONS.FRIENDLY, CONST.TOKEN_DISPOSITIONS.NEUTRAL], targetToken, 5, {canSee: true});
                            if (nearTarget !== null && nearTarget.length > 0) {
                                const maxRange = Math.max(Number(workflow.item.system.range.value), workflow.item.system.range.reach);
                                const withinRange = MidiQOL.findNearby(null, workflow.token, maxRange, {canSee: true});

                                const potentialTargets = withinRange.filter(value => nearTarget.includes(value));
                                if (potentialTargets !== null && potentialTargets.length > 0) {
                                    // ask which target to attack, if any
                                    let target_content = ``;
                                    for (let t of potentialTargets) {
                                        target_content += `<option value=${t.id}>${t.name}</option>`;
                                    }

                                    let content = '<p><label>Select the target to attack with Cleave or close the dialog to pass:</label></p>' +
                                        `<p><select name="targets">${target_content}</select></p>`;

                                    let targetId = await foundry.applications.api.DialogV2.prompt({
                                        content: content,
                                        rejectClose: false,
                                        ok: {
                                            callback: (event, button, dialog) => {
                                                return button.form.elements.targets.value
                                            }
                                        },
                                        window: {
                                            title: 'Weapon Mastery: Cleave',
                                        },
                                        position: {
                                            width: 400
                                        }
                                    });

                                    if (targetId) {
                                        let newTarget = canvas.tokens.get(targetId);
                                        if (newTarget) {
                                            let bonusValue = abilityMod > 0 ? '-@mod' : '';
                                            let itemData = workflow.item.toObject();
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

                                                let modifiedItem = new CONFIG.Item.documentClass(itemData, {parent: workflow.actor});
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
                                                await HomebrewHelpers.setTurnCheck(workflow.actor, 'mastery-cleave-used');
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    break;

                case 'graze':
                    if (workflow.macroPass === 'postAttackRoll' && !targetToken) {
                        if (abilityMod >= 0) {
                            targetToken = workflow.targets.first();
                            const damageType = workflow.item.system.damage.base.types.first();
                            const damageRoll = await new CONFIG.Dice.DamageRoll(`${abilityMod}`, {}, { type: damageType }).evaluate();
                            const itemData = {
                                name: 'Weapon Mastery: Graze',
                                type: "feat",
                                img: workflow.item.img
                            };
                            await new MidiQOL.DamageOnlyWorkflow(workflow.actor, workflow.token, null, null, [targetToken], damageRoll,
                                {
                                    itemCardId: "new",
                                    itemData: itemData,
                                    flavor: itemData.name
                                });
                        }
                    }
                    break;

                case 'nick':
                    // handled manually
                    break;

                case 'push':
                    if (workflow.macroPass === 'postDamageRoll' && macroItem && targetToken && HomebrewHelpers.isLargeOrSmaller(targetToken)) {
                        const proceed = await foundry.applications.api.DialogV2.confirm({
                            window: {
                                title: 'Weapon Mastery: Push',
                            },
                            content: `Do you want to push ${targetToken.name} 10 feet away?`,
                            rejectClose: false,
                            modal: true
                        });

                        if (proceed) {
                            await HomebrewMacros.pushTarget(workflow.token, targetToken, 2);
                        }
                    }
                    break;

                case 'sap':
                    if (workflow.macroPass === 'postAttackRoll' && targetToken) {
                        const sapEffect = {
                            name: "Sap",
                            transfer: false,
                            img: "icons/skills/melee/strike-club-red.webp",
                            origin: macroItem.uuid,
                            type: "base",
                            changes: [
                                {
                                    key: "flags.midi-qol.disadvantage.attack.all",
                                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                                    value: true,
                                    priority: 20
                                }
                            ],
                            disabled: false,
                            flags: {
                                dae: {
                                    showIcon: true,
                                    specialDuration: [
                                        'turnStartSource', '1Attack'
                                    ]
                                }
                            }
                        };
                        await MidiQOL.createEffects({ actorUuid: targetToken.actor.uuid, effects: [sapEffect] });                    }
                    break;

                case 'slow':
                    if (workflow.macroPass === 'postAttackRoll' && targetToken) {
                        const slowEffect = {
                            name: "Slow",
                            transfer: false,
                            img: "icons/environment/wilderness/terrain-rocky-ground.webp",
                            origin: macroItem.uuid,
                            type: "base",
                            changes: [
                                {
                                    key: "system.attributes.movement.all",
                                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                                    value: "-10",
                                    priority: 20
                                }
                            ],
                            disabled: false,
                            flags: {
                                dae: {
                                    showIcon: true,
                                    stackable: 'noneNameOnly',
                                    specialDuration: [
                                        'turnStartSource'
                                    ]
                                }
                            }
                        };

                        await MidiQOL.createEffects({ actorUuid: targetToken.actor.uuid, effects: [slowEffect] });
                    }
                    break;

                case 'topple':
                    if (workflow.macroPass === 'postAttackRoll' && targetToken) {
                        const proceed = await foundry.applications.api.DialogV2.confirm({
                            window: {
                                title: 'Weapon Mastery: Topple',
                            },
                            content: `Do you want to attempt to knock ${targetToken.name} prone?`,
                            rejectClose: false,
                            modal: true
                        });

                        if (proceed) {
                            const saveDC = 8 + abilityMod + workflow.actor.system.attributes.prof;
                            const saveFlavor = `${CONFIG.DND5E.abilities["con"].label} DC${saveDC} Topple`;
                            let saveRoll = await targetToken.actor.rollAbilitySave("con", {flavor: saveFlavor});
                            if (saveRoll.total < saveDC) {
                                MidiQOL.socket().executeAsGM('toggleStatusEffect',
                                    {actorUuid: targetToken.actor.uuid, statusId: 'prone', options: {active:true}});
                            }
                        }
                    }
                    break;

                case 'vex':
                    if (workflow.macroPass === 'postActiveEffects' && targetToken) {
                        const vexEffect = {
                            name: "Vex",
                            transfer: false,
                            img: "icons/skills/targeting/crosshair-arrowhead-blue.webp",
                            origin: macroItem.uuid,
                            type: "base",
                            changes: [
                                {
                                    key: "flags.midi-qol.advantage.attack.all",
                                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                                    value: `targetId == "${targetToken.id}"`,
                                    priority: 20
                                }
                            ],
                            disabled: false,
                            flags: {
                                dae: {
                                    showIcon: true,
                                    stackable: 'noneNameOnly',
                                    specialDuration: [
                                        'turnEndSource',
                                        '1Attack'
                                    ]
                                }
                            }
                        };
                        await MidiQOL.createEffects({ actorUuid: workflow.actor.uuid, effects: [vexEffect] });
                    }
                    break;
            }

        }
        else {
            console.info('Trazzm-homebrew WeaponMastery - no mastery found');
        }
    }
}
