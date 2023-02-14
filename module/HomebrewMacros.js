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

}