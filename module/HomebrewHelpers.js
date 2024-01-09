class HomebrewHelpers {

    static hasAvailableGold(actor, amount) {
        let currentPlatinum = actor.system.currency.pp;
        let currentGold = actor.system.currency.gp;
        let currentElectrum = actor.system.currency.ep;
        let currentSilver = actor.system.currency.sp;
        let currentCopper = actor.system.currency.cp;

        let remaining = amount;

        // for testing
        console.log(`hasAvailableGold(end) - PP: ${currentPlatinum}, GP: ${currentGold}, EP: ${currentElectrum}, SP: ${currentSilver}, CP: ${currentCopper}`);

        // pull from copper
        let calc = Math.floor(currentCopper / 100);
        if (calc > 0) {
            if (calc >= remaining) {
                remaining = 0;
                currentCopper -= (remaining * 100);
            }
            else {
                remaining -= calc;
                currentCopper -= (calc * 100);
            }
        }

        if (remaining > 0) {
            // pull from silver
            calc = Math.floor(currentSilver / 10);
            if (calc > 0) {
                if (calc >= remaining) {
                    remaining = 0;
                    currentSilver -= (remaining * 10);
                } else {
                    remaining -= calc;
                    currentSilver -= (calc * 10);
                }
            }

            if (remaining > 0) {
                // pull from electrum
                calc = Math.floor(currentElectrum / 2);
                if (calc > 0) {
                    if (calc >= remaining) {
                        remaining = 0;
                        currentElectrum -= (remaining * 2);
                    } else {
                        remaining -= calc;
                        currentElectrum -= (calc * 2);
                    }
                }

                if (remaining > 0) {
                    // pull from gold
                    if (currentGold >= remaining) {
                        remaining = 0;
                        currentGold -= remaining;
                    }
                    else if (currentGold > 0) {
                        remaining -= currentGold;
                        currentGold = 0;
                    }

                    if (remaining > 0) {
                        // pull from platinum
                        const platNeeded = Math.ceil(remaining / 10);
                        const goldReturned = (10 - (remaining % 10));

                        if (currentPlatinum >= platNeeded) {
                            remaining = 0;
                            currentPlatinum -= platNeeded;
                            currentGold += goldReturned;
                        }
                        else {
                            console.error("hasAvailableGold() - failed, not enough platinum");
                            return false;
                        }
                    }
                }
            }
        }

        // for testing
        console.log(`hasAvailableGold(end) - PP: ${currentPlatinum}, GP: ${currentGold}, EP: ${currentElectrum}, SP: ${currentSilver}, CP: ${currentCopper}`);

        if (remaining > 0) {
            console.log("hasAvailableGold() - failed, not enough coins");
            return false;
        }

        return true;
    }

    static async subtractGoldCost(actor, cost) {
        let currentPlatinum = actor.system.currency.pp;
        let currentGold = actor.system.currency.gp;
        let currentElectrum = actor.system.currency.ep;
        let currentSilver = actor.system.currency.sp;
        let currentCopper = actor.system.currency.cp;

        let remaining = cost;

        // pull from copper
        let calc = Math.floor(currentCopper / 100);
        if (calc > 0) {
            if (calc >= remaining) {
                remaining = 0;
                currentCopper -= (remaining * 100);
            }
            else {
                remaining -= calc;
                currentCopper -= (calc * 100);
            }
        }

        if (remaining > 0) {
            // pull from silver
            calc = Math.floor(currentSilver / 10);
            if (calc > 0) {
                if (calc >= remaining) {
                    remaining = 0;
                    currentSilver -= (remaining * 10);
                } else {
                    remaining -= calc;
                    currentSilver -= (calc * 10);
                }
            }

            if (remaining > 0) {
                // pull from electrum
                calc = Math.floor(currentElectrum / 2);
                if (calc > 0) {
                    if (calc >= remaining) {
                        remaining = 0;
                        currentElectrum -= (remaining * 2);
                    } else {
                        remaining -= calc;
                        currentElectrum -= (calc * 2);
                    }
                }

                if (remaining > 0) {
                    // pull from gold
                    if (currentGold >= remaining) {
                        remaining = 0;
                        currentGold -= remaining;
                    }
                    else if (currentGold > 0) {
                        remaining -= currentGold;
                        currentGold = 0;
                    }

                    if (remaining > 0) {
                        // pull from platinum
                        const platNeeded = Math.ceil(remaining / 10);
                        const goldReturned = (10 - (remaining % 10));

                        if (currentPlatinum >= platNeeded) {
                            remaining = 0;
                            currentPlatinum -= platNeeded;
                            currentGold += goldReturned;
                        }
                        else {
                            console.error("subtractGoldCost() - failed, not enough platinum, very strange???");
                            return false;
                        }
                    }
                }
            }
        }

        if (remaining > 0) {
            console.log("subtractGoldCost() - failed, not enough coins");
            return false;
        }

        await actor.update({"system.currency": {pp: currentPlatinum, gp: currentGold, ep: currentElectrum, sp: currentSilver, cp: currentCopper}});
        return true;
    }

    static hasSharedLanguage(actor1, actor2) {
        // check common
        for (let lang of actor1.system.traits.languages.value) {
            if (actor2.system.traits.languages.value.has(lang))
                return true;
        }

        // check custom
        let custom1 = actor1.system.traits.languages.custom.split(";");
        let custom2 = actor2.system.traits.languages.custom.split(";");
        for (let cl of custom1) {
            if (custom2.includes(cl)) {
                return true;
            }
        }

        return false;
    }

    static isAvailableThisTurn(actor, flagName) {
        if (game.combat) {
            const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
            const lastTime = actor.getFlag("fvtt-trazzm-homebrew-5e", flagName);
            if (combatTime === lastTime) {
                return false;
            }
            return true;
        }

        return false;
    }

    static async setUsedThisTurn(actor, flagName) {
        const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
        const lastTime = actor.getFlag("fvtt-trazzm-homebrew-5e", flagName);
        if (combatTime !== lastTime) {
            await actor.setFlag("fvtt-trazzm-homebrew-5e", flagName, combatTime)
        }
    }

    static async dialog(title, options) {
        let buttons = options.map(([label,value]) => ({label,value}));
        let selected = await warpgate.buttonDialog(
            {
                buttons,
                title,
            },
            'column'
        );
        return selected;
    };

    static async numberDialog(title, buttons, options) {
        let inputs = [];
        for (let i of options) {
            inputs.push({
                'label': i,
                'type': 'number'
            });
        }
        let config = {
            'title': title
        };
        return await warpgate.menu(
            {
                'inputs': inputs,
                'buttons': buttons
            },
            config
        );
    };

    static findEffect(actor, name) {
        return actor.effects.find(eff => eff.name === name);
    };

    static async updateEffect(effect, updates) {
        if (game.user.isGM) {
            await effect.update(updates);
        } else {
            updates._id = effect.id;
            await MidiQOL.socket().executeAsGM('updateEffects', {'actorUuid': effect.parent.uuid, 'updates': [updates]});
        }
    };

    static async applyDamage(tokenList, damageValue, damageType) {
        let targets;
        if (Array.isArray(tokenList)) {
            targets = new Set(tokenList);
        } else {
            targets = new Set([tokenList]);
        }
        await MidiQOL.applyTokenDamage(
            [
                {
                    damage: damageValue,
                    type: damageType
                }
            ],
            damageValue,
            targets,
            null,
            null
        );
    };

    static async addToRoll(roll, addonFormula) {
        let addonFormulaRoll = await new Roll('0 + ' + addonFormula).evaluate({async: true});
        game.dice3d?.showForRoll(addonFormulaRoll);
        for (let i = 1; i < addonFormulaRoll.terms.length; i++) {
            roll.terms.push(addonFormulaRoll.terms[i]);
        }
        roll._total += addonFormulaRoll.total;
        roll._formula = roll._formula + ' + ' + addonFormula;
        return roll;
    };

    static getSpellDC(item) {
        let spellDC;
        let scaling = item.system.save.scaling;
        if (scaling === 'spell') {
            spellDC = item.actor.system.attributes.spelldc;
        } else {
            spellDC = item.actor.system.abilities[scaling].dc;
        }
        return spellDC;
    };

    static getSpellMod(item) {
        let spellMod;
        let scaling = item.system.save.scaling;
        if (scaling === 'spell') {
            spellMod = item.actor.system.abilities[item.actor.system.attributes.spellcasting].mod;
        } else {
            spellMod = item.actor.system.abilities[scaling].mod;
        }
        return spellMod;
    };

    static async selectTarget(title, buttons, targets, returnUuid, multiple) {
        let generatedInputs = [];
        let isFirst = true;
        let number = 1;
        for (let i of targets) {
            let name;
            if (game.settings.get('chris-premades', 'Show Names')) {
                name = i.document.name;
            } else {
                if (i.document.disposition <= 0) {
                    name = 'Unknown Target (' + number + ')';
                    number++;
                } else {
                    name = i.document.name;
                }
            }
            let texture = i.document.texture.src;
            let html = `<img src="` + texture + `" id="` + i.id + `" style="width:40px;height:40px;vertical-align:middle;"><span> ` + name + `</span>`;
            let value = i.id;
            if (returnUuid) value = i.document.uuid;
            if (multiple) {
                generatedInputs.push({
                    'label': html,
                    'type': 'checkbox',
                    'options': false,
                    'value': value
                });
            } else {
                generatedInputs.push({
                    'label': html,
                    'type': 'radio',
                    'options': ['group1', isFirst],
                    'value': value
                });
                isFirst = false;
            }
        }
        function dialogRender(html) {
            let trs = html[0].getElementsByTagName('tr');
            for (let t of trs) {
                t.style.display = 'flex';
                t.style.flexFlow = 'row-reverse';
                t.style.alignItems = 'center';
                t.style.justifyContent = 'flex-end';
                if (!multiple) t.addEventListener('click', function () {t.getElementsByTagName('input')[0].checked = true});
            }
            let ths = html[0].getElementsByTagName('th');
            for (let t of ths) {
                t.style.width = 'auto';
                t.style.textAlign = 'left';
            }
            let tds = html[0].getElementsByTagName('td');
            for (let t of tds) {
                t.style.width = '50px';
                t.style.textAlign = 'center';
                t.style.paddingRight = '5px';
            }
            let imgs = html[0].getElementsByTagName('img');
            for (let i of imgs) {
                i.style.border = 'none';
                i.addEventListener('click', async function () {
                    await canvas.ping(canvas.tokens.get(i.getAttribute('id')).document.object.center);
                });
                i.addEventListener('mouseover', function () {
                    let targetToken = canvas.tokens.get(i.getAttribute('id'));
                    targetToken.hover = true;
                    targetToken.refresh();
                });
                i.addEventListener('mouseout', function () {
                    let targetToken = canvas.tokens.get(i.getAttribute('id'));
                    targetToken.hover = false;
                    targetToken.refresh();
                });
            }
        }
        let config = {
            'title': title,
            'render': dialogRender
        };
        return await warpgate.menu(
            {
                'inputs': generatedInputs,
                'buttons': buttons
            },
            config
        );
    };

    static raceOrType(actor) {
        return actor.type === "npc" ? actor.system.details?.type?.value : actor.system.details?.race;
    };

    static async getItemFromCompendium(key, name) {
        const gamePack = game.packs.get(key);
        if (!gamePack) {
            ui.notifications.warn(`Invalid compendium specified (${key})`);
            return false;
        }

        let packIndex = await gamePack.getIndex({fields: ['name', 'type', 'folder']});
        if (packIndex) {
            let match = packIndex.find(item => item.name === name);
            if (match) {
                return (await gamePack.getDocument(match._id))?.toObject();
            } else {
                ui.notifications.warn('Item not found in specified compendium!');
                return undefined;
            }
        }
        else {
            ui.notifications.warn('Pack not found in compendium!');
            return undefined;
        }
    }

    static syntheticItemWorkflowOptions(targets, useSpellSlot, castLevel, consume) {
        return [
            {
                'showFullCard': false,
                'createWorkflow': true,
                'consumeResource': consume ?? false,
                'consumeRecharge': consume ?? false,
                'consumeQuantity': consume ?? false,
                'consumeUsage': consume ?? false,
                'consumeSpellSlot': useSpellSlot ?? false,
                'consumeSpellLevel': castLevel ?? false
            },
            {
                'targetUuids': targets,
                'configureDialog': false,
                'workflowOptions': {
                    'autoRollDamage': 'always',
                    'autoFastDamage': true
                }
            }
        ];
    }

    static syntheticItemWorkflowOptions(targets, useSpellSlot, castLevel) {
        return [
            {
                'showFullCard': false,
                'createWorkflow': true,
                'consumeResource': false,
                'consumeRecharge': false,
                'consumeQuantity': false,
                'consumeUsage': false,
                'consumeSpellSlot': useSpellSlot ?? false,
                'consumeSpellLevel': castLevel ?? false
            },
            {
                'targetUuids': targets,
                'configureDialog': false,
                'workflowOptions': {
                    'autoRollDamage': 'always',
                    'autoFastDamage': true
                }
            }
        ];
    }

}
