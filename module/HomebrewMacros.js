const _flagGroup = "fvtt-trazzm-homebrew-5e";

class HomebrewMacros {

    /**
     *
     * @param {Token} token Source of the crosshairs
     * @param {Number} maxRange the maximum allowed range
     * @param {Item} item the item for which the function is called
     * @param {Token} targetToken the token that is being moved
     * @param {Number} minRange the minimum selectable range
     * @returns
     */
    static async warpgateCrosshairs(token, maxRange, item, targetToken, minRange = 5) {
        let texture = item.img;
        if (targetToken) {
            texture = targetToken.texture.src;
            if (!texture) {
                texture = targetToken.document.texture.src;
            }
            if (!texture) {
                texture = item.img;
            }
        }

        // check distance versus param while drawing crosshairs
        let crosshairsDistance = 0;

        const checkDistance = async (crosshairs) => {
            while (crosshairs.inFlight) {
                //wait for initial render
                await warpgate.wait(100);

                const ray = new Ray(token.center, crosshairs);
                const distance = canvas.grid.measureDistances([{ray}], {gridSpaces: true})[0];

                //only update if the distance has changed
                if (crosshairsDistance !== distance) {
                    crosshairsDistance = distance;
                    if (distance > maxRange) {
                        crosshairs.icon = 'icons/svg/hazard.svg';
                    } else if (minRange && distance < minRange) {
                        crosshairs.icon = 'icons/svg/hazard.svg';
                    } else {
                        crosshairs.icon = texture;
                    }

                    crosshairs.draw();
                    crosshairs.label = `${distance} ft`;
                }
            }
        };

        const location = await warpgate.crosshairs.show(
            {
                // swap between targeting the grid square vs intersection based on token's size
                interval: token.data.width % 2 === 0 ? 1 : -1,
                size: token.data.width,
                icon: texture,
                label: '0 ft.',
            },
            {
                show: checkDistance
            },
        );

        if (location.cancelled) {
            return undefined;
        }

        if (crosshairsDistance > maxRange) {
            ui.notifications.error(`${name} has a maximum range of ${maxRange} ft.`)
            return undefined;
        }

        if (minRange && crosshairsDistance < minRange) {
            ui.notifications.error(`${name} has a minimum range of ${maxRange} ft.`)
            return undefined;
        }

        return location;
    }

    static checkPosition(ignoreToken, newX, newY) {
        const hasToken = canvas.tokens.placeables.some(t => {
            const detectX = newX.between(t.document.x, t.document.x + canvas.grid.size * (t.document.width - 1));
            const detectY = newY.between(t.document.y, t.document.y + canvas.grid.size * (t.document.height - 1));
            return detectX && detectY && (ignoreToken !== t);
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
            let effect = tokenDoc.actor.effects.find(eff => eff.name === 'Cloudkill');
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
                } catch {
                }
            }
            if (createEffect && inCloudkill && (oldSpellLevel !== spellLevel || oldSpelldc !== spelldc)) {
                let damageRoll = spellLevel + 'd8';
                const damageType = "poison";
                let templateDoc = canvas.scene.collections.templates.get(templateid);
                let origin = templateDoc.flags?.dnd5e?.origin;
                let effectData = {
                    'name': 'Cloudkill',
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
                    {actorUuid: tokenDoc.actor.uuid, effects: [effectData]});
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

            let stuckEffect = tokenDoc.actor.effects.find(eff => eff.name === 'Stuck in Webs');
            let inWebEffect = tokenDoc.actor.effects.find(eff => eff.name === 'Webs');
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
                } catch {
                }
            }
            if (deleteStuckEffect && stuckEffect) {
                try {
                    await stuckEffect.delete();
                } catch {
                }

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
                            'name': 'Stuck in Webs',
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
                            {actorUuid: tokenDoc.actor.uuid, effects: [stuckEffect]});

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
                                                "value": null,
                                                "long": null,
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
                                                    "command": "const dc = " + spelldc + ";\nconst roll = await token.actor.rollAbilityTest('str', {targetValue: " + spelldc + "});\nawait game.dice3d?.showForRoll(roll);\nif (roll.total >= " + spelldc + ") {\nlet effect = token.actor.effects.find(ef => ef.name === 'Stuck in Webs');\nif (effect) await effect.delete();\nawait warpgate.revert(token.document, 'Webbed - Break Free');\nChatMessage.create({'content': '" + tokenDoc.actor.name + " breaks free of the webs!'});\n}"
                                                }
                                            }
                                        },
                                    }
                                }
                            }
                        };
                        await warpgate.mutate(tokenDoc, updates, {}, {name: "Webbed - Break Free"});
                    }
                }

                // add the general in web effect
                // difficult terrain - half movement
                // obscured vision - disadvantage on Wisdom (Perception) checks that rely on sight
                if (!inWebEffect) {
                    let effectData = {
                        'name': 'Webs',
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
                        {actorUuid: tokenDoc.actor.uuid, effects: [effectData]});
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

            let stuckEffect = tokenDoc.actor.effects.find(eff => eff.name === 'Stuck in Tentacles');
            let inTentaclesEffect = tokenDoc.actor.effects.find(eff => eff.name === 'Tentacles');
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
                } catch {
                }
            }
            if (deleteStuckEffect && stuckEffect) {
                try {
                    await stuckEffect.delete();
                } catch {
                }

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
                            'name': 'Stuck in Tentacles',
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
                            {actorUuid: tokenDoc.actor.uuid, effects: [stuckEffect]});

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
                                                "value": null,
                                                "long": null,
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
                                                    "command": "const dc = " + spelldc + ";\nconst roll = await token.actor.rollAbilityTest('" + bestAbility + "', {targetValue: " + spelldc + "});\nawait game.dice3d?.showForRoll(roll);\nif (roll.total >= " + spelldc + ") {\nlet effect = token.actor.effects.find(ef => ef.name === 'Stuck in Tentacles');\nif (effect) await effect.delete();\nawait warpgate.revert(token.document, 'Tentacled - Break Free');\nChatMessage.create({'content': '" + tokenDoc.actor.name + " breaks free of the tentacles!'});\n}"
                                                }
                                            }
                                        },
                                    }
                                }
                            }
                        };
                        await warpgate.mutate(tokenDoc, updates, {}, {name: "Tentacles - Break Free"});
                    }
                }

                // add the general in tentacles effect
                // difficult terrain - half movement
                if (!inTentaclesEffect) {
                    let effectData = {
                        'name': 'Tentacles',
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
                        {actorUuid: tokenDoc.actor.uuid, effects: [effectData]});
                }

                if (applyDamage) {
                    let damageRoll = await new Roll("3d6").roll();
                    await game.dice3d?.showForRoll(damageRoll);
                    await MidiQOL.applyTokenDamage([{
                        damage: damageRoll.total,
                        type: 'bludgeoning'
                    }], damageRoll.total, new Set([tokenDoc.object]), null, null);
                }
            }
        }
    }

    /**
     * Applies a grappled effect to the target if they are not already grappled by the source.
     *
     * @param grapplerToken     the grappling actor token
     * @param targetToken       the target actor token
     * @param saveDC            the break grapple DC. If the value is 'opposed' it will run an opposed check.
     * @param sourceActorFlag   a flag, if any, that should be removed on the grapplerToken if the grapple is broken
     * @param overtimeValue     an overtime effect value to apply to the target, if any
     * @param restrained        if present and true, also apply a restrained effect
     * @returns {Promise<boolean>}
     */
    static async applyGrappled(grapplerToken, targetToken, saveDC, sourceActorFlag, overtimeValue, restrained) {
        // sanity checks
        if (!grapplerToken || !targetToken || !saveDC) {
            console.error("applyGrappled() is missing arguments");
            return false;
        }

        let targetActor = targetToken.actor;
        let existingGrappled = targetActor.effects.find(eff => eff.name === 'Grappled' && eff.origin === grapplerToken.actor.uuid);
        if (existingGrappled) {
            console.error("applyGrappled() " + targetActor.name + " is already grappled by " + grapplerToken.name);
            return false;
        }

        // add the grappled effect to the target
        const grappledEffectName = `Grappled (${grapplerToken.name})`;
        let grappledEffect = {
            'name': grappledEffectName,
            'icon': 'icons/magic/nature/root-vine-fire-entangled-hand.webp',
            'changes': [
                {
                    'key': 'macro.CE',
                    'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    'value': 'Grappled',
                    'priority': 21
                }
            ],
            'origin': grapplerToken.actor.uuid,
            'duration': {'seconds': 3600},
            'flags': {
                'dae': {
                    'specialDuration': ['shortRest', 'longRest', 'combatEnd']
                },
            }
        };

        if (overtimeValue) {
            grappledEffect.changes.push({
                'key': 'flags.midi-qol.OverTime',
                'mode': CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                'value': overtimeValue,
                'priority': 20
            });
        }

        if (restrained) {
            grappledEffect.changes.push({
                'key': 'macro.CE',
                'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                'value': 'Restrained',
                'priority': 22
            });
        }

        await MidiQOL.socket().executeAsGM("createEffects",
            {actorUuid: targetActor.uuid, effects: [grappledEffect]});

        // add the break free feature to the target
        // remove the old one, in case it is still there
        await warpgate.revert(targetToken.document, 'Escape Grapple');

        let bestAbility = targetActor.system.abilities.dex.mod > targetActor.system.abilities.str.mod ? "dex" : "str";
        let escapeMacro = "\nconst dc = " + saveDC + ";\n\tconst roll = await token.actor.rollAbilityTest('" + bestAbility
            + "', {targetValue: " + saveDC + "});\n\tif (roll.total >= " + saveDC
            + ") {\n\t\tlet effect = token.actor.effects.find(ef => ef.name === '" + grappledEffectName + "' && ef.origin === '" + grapplerToken.actor.uuid
            + "');\n\t\tif (effect) {\n\t\t\tawait effect.delete();\n\t\t\tawait warpgate.revert(token.document, 'Escape Grapple');\n\t\t\tChatMessage.create({'content': '"
            + targetActor.name + " escapes the grapple!'});\n\t\t}\n\t}"
            + "\n\telse {\n\t\tChatMessage.create({'content': '" + targetActor.name + " failed to escape'});\n\t}";

        if (saveDC === 'opposed') {
            const bestSkill = targetActor.system.skills.ath.total < targetActor.system.skills.acr.total ? "acr" : "ath";
            escapeMacro = "let grappler = canvas.tokens.get('" + grapplerToken.id + "');\n"
                + "let results = await game.MonksTokenBar.requestContestedRoll({token: token, request:'skill:" + bestSkill + "'},\n"
                + "\t{token: grappler, request: 'skill:ath'},\n"
                + "\t{silent:true, fastForward:false, flavor: `${token.name} tries to break free`});\n"
                + "let i=0;\n"
                + "while (results.flags['monks-tokenbar'][`token${token.id}`].passed === 'waiting' && i < 30) {\n"
                + "\tawait new Promise(resolve => setTimeout(resolve, 1000));\n"
                + "\ti++;\n"
                + "}\n"
                + "let result = results.flags['monks-tokenbar'][`token${token.id}`].passed;\n"
                + "if (result === 'won' || result === 'tied') {\n"
                + "\tlet effect = token.actor.effects.find(ef => ef.name === 'Grappled' && ef.origin === '" + grapplerToken.actor.uuid + "');\n"
                + "\tif (effect) {\n"
                + "\t\tawait effect.delete();\n"
                + "\t\tawait warpgate.revert(token.document, 'Escape Grapple');\n"
                + "\t\tChatMessage.create({'content': `${token.name} escapes the grapple!`});\n"
                + "\t}\n"
                + "}";

            if (sourceActorFlag) {
                escapeMacro = "let grappler = canvas.tokens.get('" + grapplerToken.id + "');\n"
                    + "let results = await game.MonksTokenBar.requestContestedRoll({token: token, request:'skill:" + bestSkill + "'},\n"
                    + "\t{token: grappler, request: 'skill:ath'},\n"
                    + "\t{silent:true, fastForward:false, flavor: `${token.name} tries to break free`});\n"
                    + "let i=0;\n"
                    + "while (results.flags['monks-tokenbar'][`token${token.id}`].passed === 'waiting' && i < 30) {\n"
                    + "\tawait new Promise(resolve => setTimeout(resolve, 1000));\n"
                    + "\ti++;\n"
                    + "}\n"
                    + "let result = results.flags['monks-tokenbar'][`token${token.id}`].passed;\n"
                    + "if (result === 'won' || result === 'tied') {\n"
                    + "\tlet effect = token.actor.effects.find(ef => ef.name === 'Grappled' && ef.origin === '" + grapplerToken.actor.uuid + "');\n"
                    + "\tif (effect) {\n"
                    + "\t\tawait effect.delete();\n"
                    + "\t\tawait warpgate.revert(token.document, 'Escape Grapple');\n"
                    + "\t\tChatMessage.create({'content': `${token.name} escapes the grapple!`});\n"
                    + "\t}\n"
                    + "\tawait grappler.actor.unsetFlag('midi-qol', '" + sourceActorFlag + "');\n"
                    + "}";
            }
        } else if (sourceActorFlag) {
            escapeMacro = "const dc = " + saveDC + ";\nconst roll = await token.actor.rollAbilityTest('" + bestAbility
                + "', {targetValue: " + saveDC + "});\nif (roll.total >= " + saveDC
                + ") {\nlet effect = token.actor.effects.find(ef => ef.name === '" + grappledEffectName + "' && ef.origin === '" + grapplerToken.actor.uuid
                + "');\nif (effect) {\nawait effect.delete();\nawait warpgate.revert(token.document, 'Escape Grapple');\nChatMessage.create({'content': '"
                + targetActor.name + " escapes the grapple!'});\nlet sactor = await fromUuid('"
                + grapplerToken.actor.uuid + "');\nif (sactor) {\nawait sactor.unsetFlag('midi-qol', '" + sourceActorFlag + "');\n}\n}\n}";
        }

        const updates = {
            embedded: {
                Item: {
                    "Escape Grapple": {
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
                                "value": null,
                                "long": null,
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
        await warpgate.mutate(targetToken.document, updates, {}, {name: "Escape Grapple"});
        return true;
    }

    /**
     * Applies a restrained effect to the target if they are not already restrained by the source.
     *
     * @param sourceToken       the restraining actor token
     * @param targetToken       the target actor token
     * @param checkDC           the break DC
     * @param abilityCheck      the ability check type
     * @param sourceActorFlag   a flag, if any, that should be removed on the sourceToken if the condition is broken
     * @param overtimeValue     an overtime effect value to apply to the target, if any
     * @returns {Promise<boolean>}
     */
    static async applyRestrained(sourceToken, targetToken, checkDC, abilityCheck, sourceActorFlag, overtimeValue) {
        // sanity checks
        if (!sourceToken || !targetToken || !checkDC || !abilityCheck) {
            console.error("applyRestrained() is missing arguments");
            return false;
        }

        let targetActor = targetToken.actor;
        let existingRestrained = targetActor.effects.find(eff => eff.name === 'Restrained' && eff.origin === sourceToken.actor.uuid);
        if (existingRestrained) {
            console.error("applyRestrained() " + targetActor.name + " is already restrained by " + sourceToken.name);
            return false;
        }

        // add the Restrained effect to the target
        const restrainedEffectName = `Restrained (${sourceToken.name})`;
        let restrainedEffect = {
            'name': restrainedEffectName,
            'icon': 'icons/magic/control/encase-creature-spider-hold.webp',
            'changes': [
                {
                    'key': 'macro.CE',
                    'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    'value': 'Restrained',
                    'priority': 21
                }
            ],
            'origin': sourceToken.actor.uuid,
            'duration': {'seconds': 3600},
            'flags': {
                'dae': {
                    'specialDuration': ['shortRest', 'longRest', 'combatEnd']
                },
            }
        };

        if (overtimeValue) {
            restrainedEffect.changes.push({
                'key': 'flags.midi-qol.OverTime',
                'mode': CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                'value': overtimeValue,
                'priority': 20
            });
        }

        await MidiQOL.socket().executeAsGM("createEffects",
            {actorUuid: targetActor.uuid, effects: [restrainedEffect]});

        // add the break free feature to the target
        // remove the old one, in case it is still there
        await warpgate.revert(targetToken.document, 'Break Free');

        let escapeMacro = "const dc = " + checkDC + ";\nconst roll = await token.actor.rollAbilityTest('" + abilityCheck
            + "', {targetValue: " + checkDC + "});\nif (roll.total >= " + checkDC
            + ") {\nlet effect = token.actor.effects.find(ef => ef.name === '" + restrainedEffectName + "' && ef.origin === '" + sourceToken.actor.uuid
            + "');\nif (effect) {\nawait effect.delete();\nawait warpgate.revert(token.document, 'Break Free');\nChatMessage.create({'content': '"
            + targetActor.name + " breaks free!'});}\n}";
        if (sourceActorFlag) {
            escapeMacro = "const dc = " + checkDC + ";\nconst roll = await token.actor.rollAbilityTest('" + abilityCheck
                + "', {targetValue: " + checkDC + "});\nif (roll.total >= " + checkDC
                + ") {\nlet effect = token.actor.effects.find(ef => ef.name === '" + restrainedEffectName + "' && ef.origin === '" + sourceToken.actor.uuid
                + "');\nif (effect) {\nawait effect.delete();\nawait warpgate.revert(token.document, 'Break Free');\nChatMessage.create({'content': '"
                + targetActor.name + " breaks free!'});\nlet sactor = MidiQOL.MQfromActorUuid('"
                + sourceToken.actor.uuid + "');\nif (sactor) {\nawait sactor.unsetFlag('midi-qol', '" + sourceActorFlag + "');\n}\n}\n}";
        }

        const abilityName = CONFIG.DND5E.abilities[abilityCheck].label;
        const updates = {
            embedded: {
                Item: {
                    "Break Free": {
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
                                "value": null,
                                "long": null,
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
        await warpgate.mutate(targetToken.document, updates, {}, {name: "Break Free"});
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

        // can't pull more than to adjacent to the pulling token
        const tokenDistance = MidiQOL.computeDistance(pullerToken, targetToken);

        let squares = maxSquares ? maxSquares : 1;
        let pullBackFt = 5 * squares;
        pullBackFt = Math.min(pullBackFt, tokenDistance - 5);
        let pullBackFactor = pullBackFt / canvas.dimensions.distance;
        const ray = new Ray(pullerToken.center, targetToken.center);
        let newCenter = ray.project(1 - ((canvas.dimensions.size * pullBackFactor) / ray.distance));

        // check for collision
        let c = canvas.grid.getSnappedPosition(newCenter.x - targetToken.width / 2, newCenter.y - targetToken.height / 2, 1);
        let isAllowedLocation = !HomebrewMacros.checkPosition(targetToken, c.x, c.y);

        while ((squares > 1) && !isAllowedLocation) {
            squares = squares - 1;
            pullBackFt = 5 * squares;
            pullBackFactor = pullBackFt / canvas.dimensions.distance;

            let shorterCenter = ray.project(1 - ((canvas.dimensions.size * pullBackFactor) / ray.distance));
            c = canvas.grid.getSnappedPosition(shorterCenter.x - targetToken.width / 2, shorterCenter.y - targetToken.height / 2, 1);
            let isShorterAllowed = !HomebrewMacros.checkPosition(targetToken, c.x, c.y);

            if (isShorterAllowed) {
                isAllowedLocation = true;
                newCenter = shorterCenter;
                break;
            }
        }

        if (isAllowedLocation) {
            // finish the pull
            newCenter = canvas.grid.getSnappedPosition(newCenter.x - targetToken.width / 2, newCenter.y - targetToken.height / 2, 1);
            const mutationData = {token: {x: newCenter.x, y: newCenter.y}};
            await warpgate.mutate(targetToken.document, mutationData, {}, {permanent: true});
            return true;
        }

        return false;
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
        let isAllowedLocation = !HomebrewMacros.checkPosition(targetToken, c.x, c.y);

        while ((squares > 1) && !isAllowedLocation) {
            squares = squares - 1;
            knockBackFt = 5 * squares;
            knockBackFactor = knockBackFt / canvas.dimensions.distance;

            //movePixels = squares * pixelsPerSquare;
            let shorterCenter = ray.project(1 + ((canvas.dimensions.size * knockBackFactor) / ray.distance));
            c = canvas.grid.getSnappedPosition(shorterCenter.x - targetToken.width / 2, shorterCenter.y - targetToken.height / 2, 1);
            let isShorterAllowed = !HomebrewMacros.checkPosition(targetToken, c.x, c.y);

            if (isShorterAllowed) {
                isAllowedLocation = true;
                newCenter = shorterCenter;
                break;
            }
        }

        if (isAllowedLocation) {
            // finish the pull
            newCenter = canvas.grid.getSnappedPosition(newCenter.x - targetToken.width / 2, newCenter.y - targetToken.height / 2, 1);
            const mutationData = {token: {x: newCenter.x, y: newCenter.y}};
            await warpgate.mutate(targetToken.document, mutationData, {}, {permanent: true});
            return true;
        }

        return false;
    }

    /**
     * Flings the target maxSquares number of squares away from the pusher in a random direction
     *
     * @param pusherToken
     * @param targetToken
     * @param maxSquares
     * @returns {Promise<boolean>}
     */
    static async flingTarget(targetToken, maxSquares) {
        // sanity checks
        if (!targetToken) {
            console.error("flingTarget() is missing a target");
            return false;
        }

        let squares = maxSquares ? maxSquares : 1;
        let knockBackFt = 5 * squares;
        let knockBackFactor = knockBackFt / canvas.dimensions.distance;
        let distance = canvas.dimensions.size * knockBackFactor;
        const angle = (Math.random() * 360) * (Math.PI / 180);
        const ray = Ray.fromAngle(targetToken.center.x, targetToken.center.y, angle, distance);
        let newCenter = ray.project(1);

        // check for collision
        let c = canvas.grid.getSnappedPosition(newCenter.x - targetToken.width / 2, newCenter.y - targetToken.height / 2, 1);
        let isAllowedLocation = !HomebrewMacros.checkPosition(targetToken, c.x, c.y);

        while ((squares > 1) && !isAllowedLocation) {
            squares = squares - 1;
            knockBackFt = 5 * squares;
            knockBackFactor = knockBackFt / canvas.dimensions.distance;

            //movePixels = squares * pixelsPerSquare;
            let shorterCenter = ray.project(1 + ((canvas.dimensions.size * knockBackFactor) / ray.distance));
            c = canvas.grid.getSnappedPosition(shorterCenter.x - targetToken.width / 2, shorterCenter.y - targetToken.height / 2, 1);
            let isShorterAllowed = !HomebrewMacros.checkPosition(targetToken, c.x, c.y);

            if (isShorterAllowed) {
                isAllowedLocation = true;
                newCenter = shorterCenter;
                break;
            }
        }

        if (isAllowedLocation) {
            // finish the pull
            newCenter = canvas.grid.getSnappedPosition(newCenter.x - targetToken.width / 2, newCenter.y - targetToken.height / 2, 1);
            const mutationData = {token: {x: newCenter.x, y: newCenter.y}};
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
            let effect = tokenDoc.actor.effects.find(eff => eff.name === 'WallofFire');
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
                } catch {
                }
            }

            if (createEffect && inFire && (oldSpellLevel !== spellLevel || oldSpelldc !== spelldc)) {
                let dieCount = spellLevel + 1;
                let damageRoll = dieCount + 'd8';
                const damageType = "fire";
                let templateDoc = canvas.scene.collections.templates.get(templateid);
                let origin = templateDoc.flags?.dnd5e?.origin;
                let effectData = {
                    'name': 'WallofFire',
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
                    {actorUuid: tokenDoc.actor.uuid, effects: [effectData]});
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
            let effect = tokenDoc.actor.effects.find(eff => eff.name === 'WallofThorns');
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
                } catch {
                }
            }
            if (createEffect && inThorns && (oldSpellLevel !== spellLevel || oldSpelldc !== spelldc)) {
                let dieCount = spellLevel + 1;
                let damageRoll = dieCount + 'd8';
                const damageType = "slashing";
                let templateDoc = canvas.scene.collections.templates.get(templateid);
                let origin = templateDoc.flags?.dnd5e?.origin;
                let effectData = {
                    'name': 'WallofThorns',
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
                    {actorUuid: tokenDoc.actor.uuid, effects: [effectData]});
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
            let effect = tokenDoc.actor.effects.find(eff => eff.name === 'Moonbeam');
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
                } catch {
                }
            }
            if (createEffect && inBeam && (oldSpellLevel !== spellLevel || oldSpelldc !== spelldc)) {
                let dieCount = spellLevel;
                let damageRoll = dieCount + 'd10';
                const damageType = "radiant";
                let templateDoc = canvas.scene.collections.templates.get(templateid);
                let origin = templateDoc.flags?.dnd5e?.origin;
                let effectData = {
                    'name': 'Moonbeam',
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
                    {actorUuid: tokenDoc.actor.uuid, effects: [effectData]});
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
            let effect = tokenDoc.actor.effects.find(eff => eff.name === 'CreateBonfire');
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
                } catch {
                }
            }
            if (createEffect && inBeam && (oldDamageDice !== damageDice || oldSpelldc !== spelldc)) {
                let dieCount = damageDice;
                let damageRoll = dieCount + 'd8';
                const damageType = "fire";
                let templateDoc = canvas.scene.collections.templates.get(templateid);
                let origin = templateDoc.flags?.dnd5e?.origin;
                let effectData = {
                    'name': 'CreateBonfire',
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
                    {actorUuid: tokenDoc.actor.uuid, effects: [effectData]});
            }
        }
    }

    /**
     * Charges (moves) the charger to their target
     *
     * @param chargerToken  the charger
     * @param targetToken   the target
     * @param minimumDistance   the minimum distance the actor has to move to charge
     * @returns {Promise<boolean>}
     */
    static async chargeTarget(chargerToken, targetToken, minimumDistance) {
        // sanity checks
        if (!chargerToken || !targetToken) {
            console.error("chargeTarget() is missing arguments");
            return false;
        }

        // move the charger to their target
        // Get the center position of the PC token before they move
        const startPosition = chargerToken.center;

        // Calculate the two token positions and store the values as offsetX and offsetY.
        const [offsetX, offsetY] = [chargerToken.center.x - targetToken.center.x, chargerToken.center.y - targetToken.center.y];

        // Determines the offset by comparing the token and target positions to see which direction the token is attacking from.
        // If it is 0, it comes from the side. If its positive or negative, it is from some corner.
        const offset = {
            x: (offsetX === 0 ? 0 : offsetX > 0 ? 1 : -1),
            y: (offsetY === 0 ? 0 : offsetY > 0 ? 1 : -1)
        };

        new Sequence()
            .animation()
            .on(chargerToken)
            .moveTowards(targetToken, {ease: "easeInOutBack"})
            .duration(1500)
            .closestSquare()
            .effect()
            .file("jb2a.gust_of_wind.veryfast")
            .atLocation(startPosition)
            .stretchTo(chargerToken, {
                attachTo: true
            })
            .belowTokens()
            .play()
    }

    static async handleDistractingStrike({speaker, actor, token, character, item, args, scope, workflow}) {
        if (args[0].macroPass === "isAttacked") {
            if (actor) {
                let maneuverEffect = actor.effects.find(e => e.name === 'Distracting Strike - Distracted');
                if (maneuverEffect.origin !== item.actor.uuid) {
                    await MidiQOL.socket().executeAsGM('removeEffects', {
                        'actorUuid': actor.uuid,
                        'effects': [maneuverEffect.id]
                    });
                }
            }
        }
    }

    static async applyPrismaticSprayIndigo(sourceToken, targetToken, checkDC) {
        // sanity checks
        if (!sourceToken || !targetToken || !checkDC) {
            console.error("applyPrismaticSprayIndigo() is missing arguments");
            return false;
        }

        // add the Restrained effect to the target
        const restrainedEffectName = `Prismatic Spray - Indigo (${sourceToken.name})`;
        let restrainedEffect = {
            'name': restrainedEffectName,
            'icon': 'icons/magic/light/beam-rays-blue-small.webp',
            'changes': [
                {
                    'key': 'macro.CE',
                    'mode': CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    'value': 'Restrained',
                    'priority': 21
                },
                {
                    'key': 'flags.midi-qol.OverTime',
                    'mode': CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                    'value': `label=Prismatic Spray (Indigo), turn=end, saveRemove=false, macro=function.HomebrewMacros.handlePrismaticSprayIndigo, saveAbility=con, saveDC=${checkDC}`,
                    'priority': 20
                }
            ],
            'origin': sourceToken.actor.uuid,
            'flags': {
                'dae': {
                    'specialDuration': ['shortRest', 'longRest', 'combatEnd']
                },
            }
        };

        await MidiQOL.socket().executeAsGM("createEffects",
            {actorUuid: targetToken.actor.uuid, effects: [restrainedEffect]});
        return true;
    }

    static async handlePrismaticSprayIndigo({speaker, actor, token, character, item, args, scope, workflow}) {
        console.log("handlePrismaticSprayIndigo");
        let targetToken = workflow.targets.first();
        let failedSaves = 0;
        let madeSaves = 0;

        // pull flag
        let flag = targetToken.actor.getFlag(_flagGroup, "prismatic-spray-indigo");
        if (flag) {
            failedSaves = flag.failedSaves;
            madeSaves = flag.madeSaves;
        }

        if (workflow.saves.has(targetToken)) {
            madeSaves++;
        }

        if (workflow.failedSaves.has(targetToken)) {
            failedSaves++;
        }

        // check for exit condition
        let spellEffect = targetToken.actor.effects.find(e => e.name.startsWith('Prismatic Spray - Indigo ('));
        if (madeSaves >= 3) {
            ChatMessage.create({content: `${targetToken.name} breaks free from the Prismatic Spray effect`});
            await targetToken.actor.unsetFlag(_flagGroup, "prismatic-spray-indigo");

            if (spellEffect) {
                await MidiQOL.socket().executeAsGM('removeEffects', {
                    'actorUuid': targetToken.actor.uuid,
                    'effects': [spellEffect.id]
                });
            }
        }
        else if (failedSaves >= 3) {
            ChatMessage.create({content: `${targetToken.name} becomes petrified`});
            await targetToken.actor.unsetFlag(_flagGroup, "prismatic-spray-indigo");

            if (spellEffect) {
                await MidiQOL.socket().executeAsGM('removeEffects', {
                    'actorUuid': targetToken.actor.uuid,
                    'effects': [spellEffect.id]
                });
            }

            await game.dfreds.effectInterface.addEffect({ effectName: 'Petrified', uuid: targetToken.actor.uuid });
        }
        else {
            await targetToken.actor.setFlag(_flagGroup, "prismatic-spray-indigo", {failedSaves: failedSaves, madeSaves: madeSaves});
        }
    }
}