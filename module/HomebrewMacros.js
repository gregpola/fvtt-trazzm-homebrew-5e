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
                const distance = canvas.grid.measureDistances([{ray}], {gridSpaces:true})[0];

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
            interval: 1,
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

    /**
     *
     * @param {Token} actorToken Source of the crosshairs
     * @param {Number} maxRange the maximum allowed range
     * @param {Item} item the item for which the function is called
     * @returns
     */
    static async warpgateCrosshairs(actorToken, maxRange, item) {
        const tokenCenter = actorToken.center;
        let cachedDistance = 0;

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
                        crosshairs.icon = item.img;
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
            interval: 0,
            size: 1
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

                await MidiQOL.socket().executeAsGM("createEffects",
                    { actorUuid: tokenDoc.actor.uuid, effects: [effectData] });
                //await tokenDoc.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
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

                        await MidiQOL.socket().executeAsGM("createEffects",
                            { actorUuid: tokenDoc.actor.uuid, effects: [stuckEffect] });
                        //await tokenDoc.actor.createEmbeddedDocuments("ActiveEffect", [stuckEffect]);

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

                    await MidiQOL.socket().executeAsGM("createEffects",
                        { actorUuid: tokenDoc.actor.uuid, effects: [effectData] });
                    //await tokenDoc.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
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

                        await MidiQOL.socket().executeAsGM("createEffects",
                            { actorUuid: tokenDoc.actor.uuid, effects: [stuckEffect] });
                        //await tokenDoc.actor.createEmbeddedDocuments("ActiveEffect", [stuckEffect]);

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

                    await MidiQOL.socket().executeAsGM("createEffects",
                        { actorUuid: tokenDoc.actor.uuid, effects: [effectData] });
                    //await tokenDoc.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
                }

                if (applyDamage) {
                    let damageRoll = await new Roll("3d6").roll();
                    await game.dice3d?.showForRoll(damageRoll);
                    await MidiQOL.applyTokenDamage([{damage: damageRoll.total, type: 'bludgeoning' }], damageRoll.total, new Set([tokenDoc.object]), null, null);
                }
            }
        }
    }

    /**
     * Applies a grappled effect to the target if they are not already grappled by the source.
     *
     * @param sourceActor       the grappling actor
     * @param tokenDoc          the target actor token document
     * @param saveDC            the break grapple DC
     * @param sourceActorFlag   a flag, if any, that should be removed on the sourceActor if the grapple is broken
     * @param overtimeValue     an overtime effect value to apply to the target, if any
     * @param restrained        if present and true, also apply a restrained effect
     * @returns {Promise<boolean>}
     */
    static async applyGrappled(sourceActor, tokenDoc, saveDC, sourceActorFlag, overtimeValue, restrained) {
        // sanity checks
        if (!sourceActor || !tokenDoc || !saveDC) {
            console.error("applyGrappled() is missing arguments");
            return false;
        }

        let targetActor = tokenDoc.actor;
        let existingGrappled = targetActor.effects.find(eff => eff.label === 'Grappled' && eff.origin === sourceActor.uuid);
        if (existingGrappled) {
            console.error("applyGrappled() " + targetActor.name + " is already grappled by " + sourceActor.name);
            return false;
        }

        // add the grappled effect to the target
        let grappledEffect = {
            'label': 'Grappled',
            'icon': 'icons/magic/nature/root-vine-fire-entangled-hand.webp',
            'changes': [
                {
                    'key': 'flags.midi-qol.OverTime',
                    'mode': CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                    'value': overtimeValue,
                    'priority': 20
                },
                {
                    'key': 'macro.CE',
                    'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    'value': 'Grappled',
                    'priority': 21
                }
            ],
            'origin': sourceActor.uuid,
            'duration': {'seconds': 3600}
        };
        if (restrained) {
            grappledEffect = {
                'label': 'Grappled',
                'icon': 'icons/magic/nature/root-vine-fire-entangled-hand.webp',
                'changes': [
                    {
                        'key': 'flags.midi-qol.OverTime',
                        'mode': CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                        'value': overtimeValue,
                        'priority': 20
                    },
                    {
                        'key': 'macro.CE',
                        'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        'value': 'Grappled',
                        'priority': 21
                    },
                    {
                        'key': 'macro.CE',
                        'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        'value': 'Restrained',
                        'priority': 22
                    }
                ],
                'origin': sourceActor.uuid,
                'duration': {'seconds': 3600}
            };
        }

        await MidiQOL.socket().executeAsGM("createEffects",
            { actorUuid: targetActor.uuid, effects: [grappledEffect] });
        //await targetActor.createEmbeddedDocuments("ActiveEffect", [grappledEffect]);

        // add the break free feature to the target
        let bestAbility = targetActor.system.abilities.dex.mod > targetActor.system.abilities.str.mod ? "dex" : "str";
        let escapeMacro = "const dc = " + saveDC + ";\nconst roll = await token.actor.rollAbilityTest('" + bestAbility
            + "', {targetValue: " + saveDC +"});\nif (roll.total >= " + saveDC
            + ") {\nlet effect = token.actor.effects.find(ef => ef.label === 'Grappled' && ef.origin === '" + sourceActor.uuid
            + "');\nif (effect) {\nawait effect.delete();\nawait warpgate.revert(token.document, 'Escape Grapple');\nChatMessage.create({'content': '"
            + targetActor.name + " escapes the grapple!'});}\n}";
        if (sourceActorFlag) {
            escapeMacro = "const dc = " + saveDC + ";\nconst roll = await token.actor.rollAbilityTest('" + bestAbility
                + "', {targetValue: " + saveDC +"});\nif (roll.total >= " + saveDC
                + ") {\nlet effect = token.actor.effects.find(ef => ef.label === 'Grappled' && ef.origin === '" + sourceActor.uuid
                + "');\nif (effect) {\nawait effect.delete();\nawait warpgate.revert(token.document, 'Escape Grapple');\nChatMessage.create({'content': '"
                + targetActor.name + " escapes the grapple!'});\nlet sactor = MidiQOL.MQfromActorUuid('"
                + sourceActor.uuid  + "');\nif (sactor) {\nawait sactor.unsetFlag('midi-qol', '" + sourceActorFlag + "');\n}\n}\n}";
        }

        const updates = {
            embedded: {
                Item: {
                    "Escape Grapple" : {
                        "type": "feat",
                        "img": "icons/magic/nature/root-vine-entangled-hands.webp",
                        "system": {
                            "description": {
                                "value": "As an action, you can make a strength or dexterity check to escape the grapple"
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
                                    "name": "Escape Grapple",
                                    "type": "script",
                                    "scope": "global",
                                    "command": escapeMacro
                                }
                            }
                        },
                    }
                }
            }
        };
        await warpgate.mutate(tokenDoc, updates, {}, { name: "Escape Grapple" });
        return true;
    }

    /**
     * Applies a restrained effect to the target if they are not already restrained by the source.
     *
     * @param sourceActor       the source actor
     * @param tokenDoc          the target actor token document
     * @param checkDC           the break DC
     * @param abilityCheck      the ability check type
     * @param sourceActorFlag   a flag, if any, that should be removed on the sourceActor if the grapple is broken
     * @param overtimeValue     an overtime effect value to apply to the target, if any
     * @returns {Promise<boolean>}
     */
    static async applyRestrained(sourceActor, tokenDoc, checkDC, abilityCheck, sourceActorFlag, overtimeValue) {
        // sanity checks
        if (!sourceActor || !tokenDoc || !checkDC || !abilityCheck) {
            console.error("applyRestrained() is missing arguments");
            return false;
        }

        let targetActor = tokenDoc.actor;
        let existingRestrained = targetActor.effects.find(eff => eff.label === 'Restrained' && eff.origin === sourceActor.uuid);
        if (existingRestrained) {
            console.error("applyRestrained() " + targetActor.name + " is already restrained by " + sourceActor.name);
            return false;
        }

        // add the Restrained effect to the target
        let restrainedEffect = {
            'label': 'Restrained',
            'icon': 'icons/magic/control/encase-creature-spider-hold.webp',
            'changes': [
                {
                    'key': 'flags.midi-qol.OverTime',
                    'mode': CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                    'value': overtimeValue,
                    'priority': 20
                },
                {
                    'key': 'macro.CE',
                    'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    'value': 'Restrained',
                    'priority': 21
                }
            ],
            'origin': sourceActor.uuid,
            'duration': {'seconds': 3600}
        };

        await MidiQOL.socket().executeAsGM("createEffects",
            { actorUuid: targetActor.uuid, effects: [restrainedEffect] });
        //await targetActor.createEmbeddedDocuments("ActiveEffect", [restrainedEffect]);

        // add the break free feature to the target
        let escapeMacro = "const dc = " + checkDC + ";\nconst roll = await token.actor.rollAbilityTest('" + abilityCheck
            + "', {targetValue: " + checkDC +"});\nif (roll.total >= " + checkDC
            + ") {\nlet effect = token.actor.effects.find(ef => ef.label === 'Restrained' && ef.origin === '" + sourceActor.uuid
            + "');\nif (effect) {\nawait effect.delete();\nawait warpgate.revert(token.document, 'Break Free');\nChatMessage.create({'content': '"
            + targetActor.name + " breaks free!'});}\n}";
        if (sourceActorFlag) {
            escapeMacro = "const dc = " + checkDC + ";\nconst roll = await token.actor.rollAbilityTest('" + abilityCheck
                + "', {targetValue: " + checkDC +"});\nif (roll.total >= " + checkDC
                + ") {\nlet effect = token.actor.effects.find(ef => ef.label === 'Restrained' && ef.origin === '" + sourceActor.uuid
                + "');\nif (effect) {\nawait effect.delete();\nawait warpgate.revert(token.document, 'Break Free');\nChatMessage.create({'content': '"
                + targetActor.name + " breaks free!'});\nlet sactor = MidiQOL.MQfromActorUuid('"
                + sourceActor.uuid  + "');\nif (sactor) {\nawait sactor.unsetFlag('midi-qol', '" + sourceActorFlag + "');\n}\n}\n}";
        }

        const abilityName = CONFIG.DND5E.abilities[abilityCheck];
        const updates = {
            embedded: {
                Item: {
                    "Break Free" : {
                        "type": "feat",
                        "img": "icons/magic/control/encase-creature-spider-hold.webp",
                        "system": {
                            "description": {
                                "value": "As an action, you can make a " + abilityName + " check to break free"
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
                                    "command": escapeMacro
                                }
                            }
                        },
                    }
                }
            }
        };
        await warpgate.mutate(tokenDoc, updates, {}, { name: "Break Free" });
        return true;
    }

    /**
     * Pulls the target maxSquares number of squares towards the puller.
     *
     * @param pullerToken
     * @param targetToken
     * @param maxSquares
     * @returns {Promise<boolean>}
     */
    static async pullTarget(pullerToken, targetToken, maxSquares) {
        // sanity checks
        if (!pullerToken || !targetToken) {
            console.error("pullTarget() is missing arguments");
            return false;
        }

        let squares = maxSquares ? maxSquares : 1;
        let pullBackFt = 5 * squares;
        let pullBackFactor = pullBackFt / canvas.dimensions.distance;
        const ray = new Ray(pullerToken.center, targetToken.center);
        let newCenter = ray.project(1 - ((canvas.dimensions.size * pullBackFactor) / ray.distance));

        // check for collision
        let c = canvas.grid.getSnappedPosition(newCenter.x - targetToken.width / 2, newCenter.y - targetToken.height / 2, 1);
        let isAllowedLocation = !HomebrewMacros.checkPosition(c.x, c.y);

        while ((squares > 1) && !isAllowedLocation) {
            squares = squares - 1;
            pullBackFt = 5 * squares;
            pullBackFactor = pullBackFt / canvas.dimensions.distance;

            let shorterCenter = ray.project(1 - ((canvas.dimensions.size * pullBackFactor) / ray.distance));
            c = canvas.grid.getSnappedPosition(shorterCenter.x - targetToken.width / 2, shorterCenter.y - targetToken.height / 2, 1);
            let isShorterAllowed = !HomebrewMacros.checkPosition(c.x, c.y);

            if (isShorterAllowed) {
                isAllowedLocation = true;
                newCenter = shorterCenter;
                break;
            }
        }

        if (isAllowedLocation) {
            // finish the pull
            newCenter = canvas.grid.getSnappedPosition(newCenter.x - targetToken.width / 2, newCenter.y - targetToken.height / 2, 1);
            const mutationData = { token: {x: newCenter.x, y: newCenter.y}};
            await warpgate.mutate(targetToken.document, mutationData, {}, {permanent: true});
            return true;
        }

        return false;
    }

    static round5(x) {
        return (x % 5) >= 2.5 ? parseInt(x / 5) * 5 + 5 : parseInt(x / 5) * 5;
    }

    /**
     * Pushes the target maxSquares number of squares away from the pusher.
     *
     * @param pusherToken
     * @param targetToken
     * @param maxSquares
     * @returns {Promise<boolean>}
     */
    static async pushTarget(pusherToken, targetToken, maxSquares) {
        // sanity checks
        if (!pusherToken || !targetToken) {
            console.error("pullTarget() is missing arguments");
            return false;
        }

        let squares = maxSquares ? maxSquares : 1;
        let knockBackFt = 5 * squares;
        let knockBackFactor = knockBackFt / canvas.dimensions.distance;
        const ray = new Ray(pusherToken.center, targetToken.center);
        let newCenter = ray.project(1 + ((canvas.dimensions.size * knockBackFactor) / ray.distance));

        // check for collision
        let c = canvas.grid.getSnappedPosition(newCenter.x - targetToken.width / 2, newCenter.y - targetToken.height / 2, 1);
        let isAllowedLocation = !HomebrewMacros.checkPosition(c.x, c.y);

        while ((squares > 1) && !isAllowedLocation) {
            squares = squares - 1;
            knockBackFt = 5 * squares;
            knockBackFactor = knockBackFt / canvas.dimensions.distance;

            //movePixels = squares * pixelsPerSquare;
            let shorterCenter = ray.project(1 + ((canvas.dimensions.size * knockBackFactor) / ray.distance));
            c = canvas.grid.getSnappedPosition(shorterCenter.x - targetToken.width / 2, shorterCenter.y - targetToken.height / 2, 1);
            let isShorterAllowed = !HomebrewMacros.checkPosition(c.x, c.y);

            if (isShorterAllowed) {
                isAllowedLocation = true;
                newCenter = shorterCenter;
                break;
            }
        }

        if (isAllowedLocation) {
            // finish the pull
            newCenter = canvas.grid.getSnappedPosition(newCenter.x - targetToken.width / 2, newCenter.y - targetToken.height / 2, 1);
            const mutationData = { token: {x: newCenter.x, y: newCenter.y}};
            await warpgate.mutate(targetToken.document, mutationData, {}, {permanent: true});
            return true;
        }

        return false;
    }

    static async wallOfFireEffects(tokenids) {
        if (!tokenids)
            return;

        for (let i = 0; tokenids.length > i; i++) {
            let tokenDoc = canvas.scene.tokens.get(tokenids[i]);
            if (!tokenDoc) continue;

            let tokenInTemplates = game.modules.get('templatemacro').api.findContainers(tokenDoc);
            let effect = tokenDoc.actor.effects.find(eff => eff.label === 'WallofFire');
            let createEffect = false;
            let deleteEffect = false;
            let inFire = false;
            let spellLevel = -100;
            let spelldc = -100;
            let oldSpellLevel = effect?.flags?.world?.spell?.WallofFire?.spellLevel;
            let oldSpelldc = effect?.flags?.world?.spell?.WallofFire?.spelldc;
            let templateid = effect?.flags?.world?.spell?.WallofFire?.templateid;
            for (let j = 0; tokenInTemplates.length > j; j++) {
                let testTemplate = canvas.scene.collections.templates.get(tokenInTemplates[j]);
                if (!testTemplate) continue;
                let wallofFire = testTemplate.flags.world?.spell?.WallofFire;
                if (!wallofFire) continue;
                inFire = true;
                let testSpellLevel = wallofFire.spellLevel;
                let testSpelldc = wallofFire.spelldc;
                if (testSpellLevel > spellLevel) {
                    spellLevel = testSpellLevel;
                    templateid = tokenInTemplates[j];
                }
                if (testSpelldc > spelldc) {
                    spelldc = testSpelldc;
                    templateid = tokenInTemplates[j];
                }
            }

            if (!inFire) {
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

            if (createEffect && inFire && (oldSpellLevel !== spellLevel || oldSpelldc !== spelldc)) {
                let dieCount = spellLevel + 1;
                let damageRoll = dieCount + 'd8';
                const damageType = "fire";
                let templateDoc = canvas.scene.collections.templates.get(templateid);
                let origin = templateDoc.flags?.dnd5e?.origin;
                let effectData = {
                    'label': 'WallofFire',
                    'icon': 'icons/magic/fire/flame-burning-fence.webp',
                    'changes': [
                        {
                            'key': 'flags.midi-qol.OverTime',
                            'mode': 5,
                            'value': 'turn=end, damageType=' + damageType + ', damageRoll=' + damageRoll,
                            'priority': 20
                        }
                    ],
                    'origin': origin,
                    'duration': {'seconds': 60},
                    'flags': {
                        'effectmacro': {
                            'onTurnEnd': {
                                'script': "let combatTurn = game.combat.round + '-' + game.combat.turn;\nlet templateid = effect.flags.world.spell.WallofFire.templateid;\ntoken.document.setFlag('world', `spell.WallofFire.${templateid}.turn`, combatTurn);"
                            }
                        },
                        'world': {
                            'spell': {
                                'WallofFire': {
                                    'spellLevel': spellLevel,
                                    'spelldc': spelldc,
                                    'templateid': templateDoc.id
                                }
                            }
                        }
                    }
                };

                await MidiQOL.socket().executeAsGM("createEffects",
                    { actorUuid: tokenDoc.actor.uuid, effects: [effectData] });
                //await tokenDoc.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
            }
        }
    }

    static async wallOfThornsEffects(tokenids) {
        if (!tokenids)
            return;

        for (let i = 0; tokenids.length > i; i++) {
            let tokenDoc = canvas.scene.tokens.get(tokenids[i]);
            if (!tokenDoc) continue;

            let tokenInTemplates = game.modules.get('templatemacro').api.findContainers(tokenDoc);
            let effect = tokenDoc.actor.effects.find(eff => eff.label === 'WallofThorns');
            let createEffect = false;
            let deleteEffect = false;
            let inThorns = false;
            let spellLevel = -100;
            let spelldc = -100;
            let oldSpellLevel = effect?.flags?.world?.spell?.WallofThorns?.spellLevel;
            let oldSpelldc = effect?.flags?.world?.spell?.WallofThorns?.spelldc;
            let templateid = effect?.flags?.world?.spell?.WallofThorns?.templateid;
            for (let j = 0; tokenInTemplates.length > j; j++) {
                let testTemplate = canvas.scene.collections.templates.get(tokenInTemplates[j]);
                if (!testTemplate) continue;
                let wallofThorns = testTemplate.flags.world?.spell?.WallofThorns;
                if (!wallofThorns) continue;
                inThorns = true;
                let testSpellLevel = wallofThorns.spellLevel;
                let testSpelldc = wallofThorns.spelldc;
                if (testSpellLevel > spellLevel) {
                    spellLevel = testSpellLevel;
                    templateid = tokenInTemplates[j];
                }
                if (testSpelldc > spelldc) {
                    spelldc = testSpelldc;
                    templateid = tokenInTemplates[j];
                }
            }
            if (!inThorns) {
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
            if (createEffect && inThorns && (oldSpellLevel !== spellLevel || oldSpelldc !== spelldc)) {
                let dieCount = spellLevel + 1;
                let damageRoll = dieCount + 'd8';
                const damageType = "slashing";
                let templateDoc = canvas.scene.collections.templates.get(templateid);
                let origin = templateDoc.flags?.dnd5e?.origin;
                let effectData = {
                    'label': 'WallofThorns',
                    'icon': 'icons/magic/nature/root-vine-barrier-wall-brown.webp',
                    'changes': [
                        {
                            'key': 'flags.midi-qol.OverTime',
                            'mode': 5,
                            'value': 'turn=end, rollType=save, saveAbility=dex, saveDamage=halfdamage, saveRemove=false, saveMagic=true, damageType=' + damageType + ', damageRoll=' + damageRoll + ', saveDC =' + spelldc,
                            'priority': 20
                        }
                    ],
                    'origin': origin,
                    'duration': {'seconds': 600},
                    'flags': {
                        'effectmacro': {
                            'onTurnStart': {
                                'script': "let combatTurn = game.combat.round + '-' + game.combat.turn;\nlet templateid = effect.flags.world.spell.WallofThorns.templateid;\ntoken.document.setFlag('world', `spell.WallofThorns.${templateid}.turn`, combatTurn);"
                            }
                        },
                        'world': {
                            'spell': {
                                'WallofThorns': {
                                    'spellLevel': spellLevel,
                                    'spelldc': spelldc,
                                    'templateid': templateDoc.id
                                }
                            }
                        }
                    }
                };

                await MidiQOL.socket().executeAsGM("createEffects",
                    { actorUuid: tokenDoc.actor.uuid, effects: [effectData] });
                //await tokenDoc.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
            }
        }
    }

    static async moonbeamEffects(tokenids) {
        if (!tokenids)
            return;

        for (let i = 0; tokenids.length > i; i++) {
            let tokenDoc = canvas.scene.tokens.get(tokenids[i]);
            if (!tokenDoc) continue;

            let tokenInTemplates = game.modules.get('templatemacro').api.findContainers(tokenDoc);
            let effect = tokenDoc.actor.effects.find(eff => eff.label === 'Moonbeam');
            let createEffect = false;
            let deleteEffect = false;
            let inBeam = false;
            let spellLevel = -100;
            let spelldc = -100;
            let oldSpellLevel = effect?.flags?.world?.spell?.Moonbeam?.spellLevel;
            let oldSpelldc = effect?.flags?.world?.spell?.Moonbeam?.spelldc;
            let ambientLightId = effect?.flags?.world?.spell?.Moonbeam?.ambientLightId;

            let templateid = effect?.flags?.world?.spell?.Moonbeam?.templateid;
            for (let j = 0; tokenInTemplates.length > j; j++) {
                let testTemplate = canvas.scene.collections.templates.get(tokenInTemplates[j]);
                if (!testTemplate) continue;
                let moonbeam = testTemplate.flags.world?.spell?.Moonbeam;
                if (!moonbeam) continue;
                inBeam = true;
                let testSpellLevel = moonbeam.spellLevel;
                let testSpelldc = moonbeam.spelldc;
                if (testSpellLevel > spellLevel) {
                    spellLevel = testSpellLevel;
                    templateid = tokenInTemplates[j];
                }
                if (testSpelldc > spelldc) {
                    spelldc = testSpelldc;
                    templateid = tokenInTemplates[j];
                }
            }

            if (!inBeam) {
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
            if (createEffect && inBeam && (oldSpellLevel !== spellLevel || oldSpelldc !== spelldc)) {
                let dieCount = spellLevel;
                let damageRoll = dieCount + 'd10';
                const damageType = "radiant";
                let templateDoc = canvas.scene.collections.templates.get(templateid);
                let origin = templateDoc.flags?.dnd5e?.origin;
                let effectData = {
                    'label': 'Moonbeam',
                    'icon': 'icons/magic/light/beam-rays-yellow-blue.webp',
                    'changes': [
                        {
                            'key': 'flags.midi-qol.OverTime',
                            'mode': 5,
                            'value': 'turn=start, rollType=save, saveAbility=con, saveDamage=halfdamage, saveRemove=false, saveMagic=true, damageType=' + damageType + ', damageRoll=' + damageRoll + ', saveDC =' + spelldc,
                            'priority': 20
                        }
                    ],
                    'origin': origin,
                    'duration': {'seconds': 600},
                    'flags': {
                        'effectmacro': {
                            'onTurnStart': {
                                'script': "let combatTurn = game.combat.round + '-' + game.combat.turn;\nlet templateid = effect.flags.world.spell.Moonbeam.templateid;\ntoken.document.setFlag('world', `spell.Moonbeam.${templateid}.turn`, combatTurn);"
                            }
                        },
                        'world': {
                            'spell': {
                                'Moonbeam': {
                                    'spellLevel': spellLevel,
                                    'spelldc': spelldc,
                                    'templateid': templateDoc.id,
                                    'ambientLightId': ambientLightId
                                }
                            }
                        }
                    }
                };

                await MidiQOL.socket().executeAsGM("createEffects",
                    { actorUuid: tokenDoc.actor.uuid, effects: [effectData] });
                //await tokenDoc.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
            }
        }
    }

    static async createBonfireEffects(tokenids) {
        if (!tokenids)
            return;

        for (let i = 0; tokenids.length > i; i++) {
            let tokenDoc = canvas.scene.tokens.get(tokenids[i]);
            if (!tokenDoc) continue;

            let tokenInTemplates = game.modules.get('templatemacro').api.findContainers(tokenDoc);
            let effect = tokenDoc.actor.effects.find(eff => eff.label === 'CreateBonfire');
            let createEffect = false;
            let deleteEffect = false;
            let inBeam = false;
            let damageDice = 1;
            let spelldc = -100;
            let oldDamageDice = effect?.flags?.world?.spell?.CreateBonfire?.cantripDice;
            let oldSpelldc = effect?.flags?.world?.spell?.CreateBonfire?.spelldc;

            let templateid = effect?.flags?.world?.spell?.CreateBonfire?.templateid;
            for (let j = 0; tokenInTemplates.length > j; j++) {
                let testTemplate = canvas.scene.collections.templates.get(tokenInTemplates[j]);
                if (!testTemplate) continue;
                let createBonfire = testTemplate.flags.world?.spell?.CreateBonfire;
                if (!createBonfire) continue;
                inBeam = true;
                let testDamageDice = createBonfire.cantripDice;
                let testSpelldc = createBonfire.spelldc;
                if (testDamageDice > damageDice) {
                    damageDice = testDamageDice;
                    templateid = tokenInTemplates[j];
                }
                if (testSpelldc > spelldc) {
                    spelldc = testSpelldc;
                    templateid = tokenInTemplates[j];
                }
            }

            if (!inBeam) {
                deleteEffect = true;
            } else {
                if (oldDamageDice !== damageDice || oldSpelldc !== spelldc) {
                    createEffect = true;
                    deleteEffect = true;
                }
            }
            if (deleteEffect && effect) {
                try {
                    await effect.delete();
                } catch {}
            }
            if (createEffect && inBeam && (oldDamageDice !== damageDice || oldSpelldc !== spelldc)) {
                let dieCount = damageDice;
                let damageRoll = dieCount + 'd8';
                const damageType = "fire";
                let templateDoc = canvas.scene.collections.templates.get(templateid);
                let origin = templateDoc.flags?.dnd5e?.origin;
                let effectData = {
                    'label': 'CreateBonfire',
                    'icon': 'icons/magic/fire/flame-burning-campfire-orange.webp',
                    'changes': [
                        {
                            'key': 'flags.midi-qol.OverTime',
                            'mode': 5,
                            'value': 'turn=start, rollType=save, saveAbility=con, saveDamage=halfdamage, saveRemove=false, saveMagic=true, damageType=' + damageType + ', damageRoll=' + damageRoll + ', saveDC =' + spelldc,
                            'priority': 20
                        }
                    ],
                    'origin': origin,
                    'duration': {'seconds': 600},
                    'flags': {
                        'effectmacro': {
                            'onTurnStart': {
                                'script': "let combatTurn = game.combat.round + '-' + game.combat.turn;\nlet templateid = effect.flags.world.spell.CreateBonfire.templateid;\ntoken.document.setFlag('world', `spell.CreateBonfire.${templateid}.turn`, combatTurn);"
                            }
                        },
                        'world': {
                            'spell': {
                                'CreateBonfire': {
                                    'cantripDice': damageDice,
                                    'spelldc': spelldc,
                                    'templateid': templateDoc.id
                                }
                            }
                        }
                    }
                };

                await MidiQOL.socket().executeAsGM("createEffects",
                    { actorUuid: tokenDoc.actor.uuid, effects: [effectData] });
                //await tokenDoc.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
            }
        }
    }
}