class HomebrewMacros {

    /**
     *
     * @param {Token} actorToken Source of the crosshairs
     * @param {Number} maxRange the maximum allowed range
     * @param {Item} item the item for which the function is called
     * @param {Token} targetToken the token that is being moved
     * @returns
     */
    static async warpgateCrosshairs(actorToken, maxRange, item, targetToken) {
        const tokenCenter = actorToken.center;
        let cachedDistance = 0;

        let texture = targetToken.texture.src;
        if (!texture)
            texture = targetToken.document.texture.src;

        const checkDistance = async(crosshairs) => {
            while (crosshairs.inFlight) {
                //wait for initial render
                await warpgate.wait(100);
                const ray = new Ray( tokenCenter, crosshairs );
                const distance = canvas.grid.measureDistances([{ray}], {gridSpaces:true})[0]

                //only update if the distance has changed
                if (cachedDistance !== distance) {
                    cachedDistance = distance;
                    if(distance > maxRange) {
                        crosshairs.icon = 'icons/svg/hazard.svg';
                    } else {
                        crosshairs.icon = texture;
                    }

                    crosshairs.draw();
                    crosshairs.label = `${distance} ft`;
                }
            }
        };

        const callbacks = {
            show: checkDistance
        };

        const config = {
            drawIcon: true,
            interval: targetToken.width % 2 === 0 ? 1 : -1,
            size: targetToken.width / canvas.grid.size
        };

        if (typeof item !== 'undefined') {
            config.drawIcon = true;
            config.icon = item.img;
            config.label = item.name;
        }

        const position = await warpgate.crosshairs.show(config, callbacks);

        if (position.cancelled) return false;
        if (cachedDistance > maxRange) {
            ui.notifications.error(`${name} has a maximum range of ${maxRange} ft.`)
            return false;
        }
        return position;
    }

    static checkPosition(newX, newY) {
        const hasToken = canvas.tokens.placeables.some(t => {
            const detectX = newX.between(t.document.x, t.document.x + canvas.grid.size * (t.document.width-1));
            const detectY = newY.between(t.document.y, t.document.y + canvas.grid.size * (t.document.height-1));
            return detectX && detectY;
        });
        return hasToken;
    }

    static async cloudkillEffects(tokenids) {
        if (!tokenids)
            return;

        for (let i = 0; tokenids.length > i; i++) {
            let tokenDoc = canvas.scene.tokens.get(tokenids[i]);
            if (!tokenDoc) continue;

            let tokenInTemplates = game.modules.get('templatemacro').api.findContainers(tokenDoc);
            let effect = tokenDoc.actor.effects.find(eff => eff.label === 'Cloudkill');
            let createEffect = false;
            let deleteEffect = false;
            let inCloudkill = false;
            let spellLevel = -100;
            let spelldc = -100;
            let oldSpellLevel = effect?.flags?.world?.spell?.cloudkill?.spellLevel;
            let oldSpelldc = effect?.flags?.world?.spell?.cloudkill?.spelldc;
            let templateid = effect?.flags?.world?.spell?.cloudkill?.templateid;
            for (let j = 0; tokenInTemplates.length > j; j++) {
                let testTemplate = canvas.scene.collections.templates.get(tokenInTemplates[j]);
                if (!testTemplate) continue;
                let cloudkill = testTemplate.flags.world?.spell?.cloudkill;
                if (!cloudkill) continue;
                inCloudkill = true;
                let testSpellLevel = cloudkill.spellLevel;
                let testSpelldc = cloudkill.spelldc;
                if (testSpellLevel > spellLevel) {
                    spellLevel = testSpellLevel;
                    templateid = tokenInTemplates[j];
                }
                if (testSpelldc > spelldc) {
                    spelldc = testSpelldc;
                    templateid = tokenInTemplates[j];
                }
            }
            if (!inCloudkill) {
                deleteEffect = true;
            } else {
                if (oldSpellLevel !== spellLevel || oldSpelldc !== spelldc) {
                    createEffect = true;
                    deleteEffect = true;
                }
            }
            if (deleteEffect && effect) {
                try {
                    await effect.delete();
                } catch {}
            }
            if (createEffect && inCloudkill && (oldSpellLevel !== spellLevel || oldSpelldc !== spelldc)) {
                let damageRoll = spellLevel + 'd8';
                const damageType = "poison";
                let templateDoc = canvas.scene.collections.templates.get(templateid);
                let origin = templateDoc.flags?.dnd5e?.origin;
                let effectData = {
                    'label': 'Cloudkill',
                    'icon': 'icons/magic/air/fog-gas-smoke-swirling-green.webp',
                    'changes': [
                        {
                            'key': 'flags.midi-qol.OverTime',
                            'mode': 5,
                            'value': 'turn=start, rollType=save, saveAbility= con, saveDamage= halfdamage, saveRemove= false, saveMagic=true, damageType= ' + damageType + ', damageRoll= ' + damageRoll + ', saveDC = ' + spelldc,
                            'priority': 20
                        }
                    ],
                    'origin': origin,
                    'duration': {'seconds': 600},
                    'flags': {
                        'effectmacro': {
                            'onTurnStart': {
                                'script': "let combatTurn = game.combat.round + '-' + game.combat.turn;\nlet templateid = effect.flags.world.spell.cloudkill.templateid;\ntoken.document.setFlag('world', `spell.cloudkill.${templateid}.turn`, combatTurn);"
                            }
                        },
                        'world': {
                            'spell': {
                                'cloudkill': {
                                    'spellLevel': spellLevel,
                                    'spelldc': spelldc,
                                    'templateid': templateDoc.id
                                }
                            }
                        }
                    }
                };
                await tokenDoc.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
            }
        }
    }

    static async webSpellEffects(tokenids, firstTime = false) {
        if (!tokenids)
            return;

        for (let i = 0; tokenids.length > i; i++) {
            let tokenDoc = canvas.scene.tokens.get(tokenids[i]);
            if (!tokenDoc) continue;

            let tokenInTemplates = game.modules.get('templatemacro').api.findContainers(tokenDoc);

            let stuckEffect = tokenDoc.actor.effects.find(eff => eff.label === 'Stuck in Webs');
            let inWebEffect = tokenDoc.actor.effects.find(eff => eff.label === 'Webs');
            let inWeb = false;
            let deleteStuckEffect = false;
            let deleteWebsEffect = false;
            let applyEffects = false;

            let spellLevel = -100;
            let spelldc = -100;
            let oldSpellLevel = inWebEffect?.flags?.world?.spell?.web?.spellLevel;
            let oldSpelldc = inWebEffect?.flags?.world?.spell?.web?.spelldc;
            let templateid = inWebEffect?.flags?.world?.spell?.web?.templateid;

            // Look for the most powerful web template
            for (let j = 0; tokenInTemplates.length > j; j++) {
                // Only want tokens in the web spell template
                let testTemplate = canvas.scene.collections.templates.get(tokenInTemplates[j]);
                if (!testTemplate) continue;
                let webSpell = testTemplate.flags.world?.spell?.web;
                if (!webSpell) continue;
                inWeb = true;
                let testSpellLevel = webSpell.spellLevel;
                let testSpelldc = webSpell.spelldc;
                if (testSpellLevel > spellLevel) {
                    spellLevel = testSpellLevel;
                    templateid = tokenInTemplates[j];
                }
                if (testSpelldc > spelldc) {
                    spelldc = testSpelldc;
                    templateid = tokenInTemplates[j];
                }
            }

            // determine what needs to change on the token
            if (!inWeb) {
                deleteStuckEffect = true;
                deleteWebsEffect = true;
            } else {
                if (oldSpellLevel !== spellLevel || oldSpelldc !== spelldc) {
                    deleteStuckEffect = true;
                    deleteWebsEffect = true;
                    applyEffects = true;
                }
            }

            // Delete old effects if needed
            if (deleteWebsEffect && inWebEffect) {
                try {
                    await inWebEffect.delete();
                } catch {}
            }
            if (deleteStuckEffect && stuckEffect) {
                try {
                    await stuckEffect.delete();
                } catch {}

                await warpgate.revert(tokenDoc, 'Webbed - Break Free');
            }

            // Apply new effects as appropriate
            if (inWeb) {
                let templateDoc = canvas.scene.collections.templates.get(templateid);
                let origin = templateDoc.flags?.dnd5e?.origin;

                // if not restrained, roll a new save
                if (!stuckEffect && !firstTime) {
                    let saveRoll = await tokenDoc.actor.rollAbilitySave("dex", {flavor: "Resist webs - DC " + spelldc});
                    await game.dice3d?.showForRoll(saveRoll);

                    if (saveRoll.total < spelldc) {
                        let stuckEffect = {
                            'label': 'Stuck in Webs',
                            'icon': 'icons/creatures/webs/webthin-blue.webp',
                            'changes': [
                                {
                                    'key': 'macro.CE',
                                    'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                                    'value': 'Restrained',
                                    'priority': 20
                                }
                            ],
                            'origin': origin,
                            'duration': {'seconds': 3600}
                        };
                        await tokenDoc.actor.createEmbeddedDocuments("ActiveEffect", [stuckEffect]);

                        // add the break free feature
                        const updates = {
                            embedded: {
                                Item: {
                                    "Webbed - Break Free": {
                                        "type": "feat",
                                        "img": "icons/creatures/webs/web-spider-glowing-purple.webp",
                                        "system": {
                                            "description": {
                                                "value": "As an action, the restrained target can make a strength check to break free"
                                            },
                                            "activation": {
                                                "type": "action",
                                                "cost": 1
                                            },
                                            "target": {
                                                "value": null,
                                                "type": "self"
                                            },
                                            "range": {
                                                "value":null,
                                                "long":null,
                                                "units": "self"
                                            },
                                            "duration": {
                                                "value": null,
                                                "units": "inst"
                                            },
                                            "cover": null,
                                        },
                                        "flags": {
                                            "midi-qol": {
                                                "onUseMacroName": "ItemMacro"
                                            },
                                            "itemacro": {
                                                "macro": {
                                                    "name": "Break Free",
                                                    "type": "script",
                                                    "scope": "global",
                                                    "command": "const dc = " + spelldc + ";\nconst roll = await token.actor.rollAbilityTest('str', {targetValue: " + spelldc +"});\nawait game.dice3d?.showForRoll(roll);\nif (roll.total >= " + spelldc + ") {\nlet effect = token.actor.effects.find(ef => ef.label === 'Stuck in Webs');\nif (effect) await effect.delete();\nawait warpgate.revert(token.document, 'Webbed - Break Free');\nChatMessage.create({'content': '" + tokenDoc.actor.name + " breaks free of the webs!'});\n}"
                                                }
                                            }
                                        },
                                    }
                                }
                            }
                        };
                        await warpgate.mutate(tokenDoc, updates, {}, { name: "Webbed - Break Free" });
                    }
                }

                // add the general in web effect
                // difficult terrain - half movement
                // obscured vision - disadvantage on Wisdom (Perception) checks that rely on sight
                if (!inWebEffect) {
                    let effectData = {
                        'label': 'Webs',
                        'icon': 'icons/creatures/webs/web-spider-glowing-purple.webp',
                        'changes': [
                            {
                                'key': 'system.attributes.movement.all',
                                'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                                'value': '*0.5',
                                'priority': 20
                            },
                            {
                                'key': 'flags.midi-qol.disadvantage.skill.prc',
                                'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                                'value': '1',
                                'priority': 20
                            }
                        ],
                        'origin': origin,
                        'duration': {'seconds': 3600},
                        'flags': {
                            'effectmacro': {
                                'onTurnStart': {
                                    'script': "await HomebrewMacros.webSpellEffects([token.id]);"
                                }
                            },
                            'world': {
                                'spell': {
                                    'web': {
                                        'spellLevel': spellLevel,
                                        'spelldc': spelldc,
                                        'templateid': templateDoc.id
                                    }
                                }
                            }
                        }
                    };
                    await tokenDoc.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
                }
            }
        }
    }

    static async evardsBlackTentaclesEffects(tokenids, firstTime = false) {
        if (!tokenids)
            return;

        for (let i = 0; tokenids.length > i; i++) {
            let tokenDoc = canvas.scene.tokens.get(tokenids[i]);
            if (!tokenDoc) continue;

            let tokenInTemplates = game.modules.get('templatemacro').api.findContainers(tokenDoc);

            let stuckEffect = tokenDoc.actor.effects.find(eff => eff.label === 'Stuck in Tentacles');
            let inTentaclesEffect = tokenDoc.actor.effects.find(eff => eff.label === 'Tentacles');
            let inTentacles = false;
            let deleteStuckEffect = false;
            let deleteTentaclesEffect = false;
            let applyEffects = false;

            let spellLevel = -100;
            let spelldc = -100;
            let oldSpellLevel = inTentaclesEffect?.flags?.world?.spell?.evardsblacktentacles?.spellLevel;
            let oldSpelldc = inTentaclesEffect?.flags?.world?.spell?.evardsblacktentacles?.spelldc;
            let templateid = inTentaclesEffect?.flags?.world?.spell?.evardsblacktentacles?.templateid;

            // Look for the most powerful tentacles template
            for (let j = 0; tokenInTemplates.length > j; j++) {
                // Only want tokens in the evard's black tentacles template
                let testTemplate = canvas.scene.collections.templates.get(tokenInTemplates[j]);
                if (!testTemplate) continue;
                let tentaclesSpell = testTemplate.flags.world?.spell?.evardsblacktentacles;
                if (!tentaclesSpell) continue;

                inTentacles = true;
                let testSpellLevel = tentaclesSpell.spellLevel;
                let testSpelldc = tentaclesSpell.spelldc;
                if (testSpellLevel > spellLevel) {
                    spellLevel = testSpellLevel;
                    templateid = tokenInTemplates[j];
                }
                if (testSpelldc > spelldc) {
                    spelldc = testSpelldc;
                    templateid = tokenInTemplates[j];
                }
            }

            // determine what needs to change on the token
            if (!inTentacles) {
                deleteStuckEffect = true;
                deleteTentaclesEffect = true;
            } else {
                if (oldSpellLevel !== spellLevel || oldSpelldc !== spelldc) {
                    deleteStuckEffect = true;
                    deleteTentaclesEffect = true;
                    applyEffects = true;
                }
            }

            // Delete old effects if needed
            if (deleteTentaclesEffect && inTentaclesEffect) {
                try {
                    await inTentaclesEffect.delete();
                } catch {}
            }
            if (deleteStuckEffect && stuckEffect) {
                try {
                    await stuckEffect.delete();
                } catch {}

                await warpgate.revert(tokenDoc, 'Tentacles - Break Free');
            }

            // Apply new effects as appropriate
            if (inTentacles) {
                let applyDamage = stuckEffect;
                let templateDoc = canvas.scene.collections.templates.get(templateid);
                let origin = templateDoc.flags?.dnd5e?.origin;

                // if not restrained, roll a new save
                if (!stuckEffect && !firstTime) {
                    let saveRoll = await tokenDoc.actor.rollAbilitySave("dex", {flavor: "Resist tentacles - DC " + spelldc});
                    await game.dice3d?.showForRoll(saveRoll);

                    if (saveRoll.total < spelldc) {
                        applyDamage = true;

                        let stuckEffect = {
                            'label': 'Stuck in Tentacles',
                            'icon': 'icons/magic/nature/root-vine-fire-entangled-hand.webp',
                            'changes': [
                                {
                                    'key': 'macro.CE',
                                    'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                                    'value': 'Restrained',
                                    'priority': 20
                                }
                            ],
                            'origin': origin,
                            'duration': {'seconds': 3600}
                        };
                        await tokenDoc.actor.createEmbeddedDocuments("ActiveEffect", [stuckEffect]);

                        // add the break free feature
                        let bestAbility = tokenDoc.actor.system.abilities.dex.mod > tokenDoc.actor.system.abilities.str.mod ? "dex" : "str";
                        const updates = {
                            embedded: {
                                Item: {
                                    "Tentacled - Break Free": {
                                        "type": "feat",
                                        "img": "icons/magic/nature/root-vine-entangled-hands.webp",
                                        "system": {
                                            "description": {
                                                "value": "As an action, the restrained target can make a strength or dexterity check to break free"
                                            },
                                            "activation": {
                                                "type": "action",
                                                "cost": 1
                                            },
                                            "target": {
                                                "value": null,
                                                "type": "self"
                                            },
                                            "range": {
                                                "value":null,
                                                "long":null,
                                                "units": "self"
                                            },
                                            "duration": {
                                                "value": null,
                                                "units": "inst"
                                            },
                                            "cover": null,
                                        },
                                        "flags": {
                                            "midi-qol": {
                                                "onUseMacroName": "ItemMacro"
                                            },
                                            "itemacro": {
                                                "macro": {
                                                    "name": "Break Free",
                                                    "type": "script",
                                                    "scope": "global",
                                                    "command": "const dc = " + spelldc + ";\nconst roll = await token.actor.rollAbilityTest('" + bestAbility + "', {targetValue: " + spelldc +"});\nawait game.dice3d?.showForRoll(roll);\nif (roll.total >= " + spelldc + ") {\nlet effect = token.actor.effects.find(ef => ef.label === 'Stuck in Tentacles');\nif (effect) await effect.delete();\nawait warpgate.revert(token.document, 'Tentacled - Break Free');\nChatMessage.create({'content': '" + tokenDoc.actor.name + " breaks free of the tentacles!'});\n}"
                                                }
                                            }
                                        },
                                    }
                                }
                            }
                        };
                        await warpgate.mutate(tokenDoc, updates, {}, { name: "Tentacles - Break Free" });
                    }
                }

                // add the general in tentacles effect
                // difficult terrain - half movement
                if (!inTentaclesEffect) {
                    let effectData = {
                        'label': 'Tentacles',
                        'icon': 'icons/creatures/tentacles/tentacles-suctioncups-pink.webp',
                        'changes': [
                            {
                                'key': 'system.attributes.movement.all',
                                'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                                'value': '*0.5',
                                'priority': 20
                            }
                        ],
                        'origin': origin,
                        'duration': {'seconds': 3600},
                        'flags': {
                            'effectmacro': {
                                'onTurnStart': {
                                    'script': "await HomebrewMacros.evardsBlackTentaclesEffects([token.id]);"
                                }
                            },
                            'world': {
                                'spell': {
                                    'evardsblacktentacles': {
                                        'spellLevel': spellLevel,
                                        'spelldc': spelldc,
                                        'templateid': templateDoc.id
                                    }
                                }
                            }
                        }
                    };
                    await tokenDoc.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
                }

                if (applyDamage) {
                    let damageRoll = await new Roll("3d6").roll();
                    await game.dice3d?.showForRoll(damageRoll);
                    await MidiQOL.applyTokenDamage([{damage: damageRoll.total, type: 'bludgeoning' }], damageRoll.total, new Set([tokenDoc.object]), null, null);
                }
            }
        }
    }

}