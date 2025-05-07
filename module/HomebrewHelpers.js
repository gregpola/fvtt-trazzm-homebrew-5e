// These values must be lower case
const _blindedResistLabels = new Set(["second head"]);
const _charmResistLabels = new Set(["alien mind", "countercharm", "dark devotion", "duergar resilience", "fey ancestry", "leviathan will", "mental discipline", "heart of hruggek", "psionic fortitude", "second head", "two heads"]);
const _deafenedResistLabels = new Set(["second head"]);
const _frightenedResistLabels = new Set(["brave", "countercharm", "dark devotion", "fearless", "leviathan will", "mental discipline", "heart of hruggek", "second head", "two heads", "kobold legacy - defiance"]);
const _paralyzedResistLabels = new Set(["duergar resilience", "leviathan will", "heart of hruggek"]);
const _poisonResistItems = new Set(["duergar resilience", "deathless nature (reborn)", "dwarven resilience", "infernal constitution", "leviathan will", "poison resilience", "stout resilience", "heart of hruggek"]);
const _poisonResistEffects = new Set(["hill rune", "leviathan will", "antitoxin", "protection from poison"]);
const _proneResistLabels = new Set(["sure-footed"]);
const _sleepResistLabels = new Set(["leviathan will", "heart of hruggek", "wakeful"]);
const _stunResistLabels = new Set(["leviathan will", "heart of hruggek", "psionic fortitude", "second head", "two heads"]);
const _turnResistLabels = new Set(["turning defiance"]);
const _turnImmunityLabels = new Set(["turn immunity"]);

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
            } else {
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
                    } else if (currentGold > 0) {
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
                        } else {
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
            } else {
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
                    } else if (currentGold > 0) {
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
                        } else {
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

        await actor.update({
            "system.currency": {
                pp: currentPlatinum,
                gp: currentGold,
                ep: currentElectrum,
                sp: currentSilver,
                cp: currentCopper
            }
        });
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

    static isSameSizeOrSmaller(token, target) {
        const tokenSize = token.actor.system.traits.size;
        const targetSize = target.actor.system.traits.size;
        const tokenSizeNum = Object.keys(CONFIG.DND5E.actorSizes).indexOf(tokenSize);
        const targetSizeNum = Object.keys(CONFIG.DND5E.actorSizes).indexOf(targetSize);

        if (targetSizeNum - tokenSizeNum > 0) {
            return false;
        }

        return true;
    }

    static isSizeEligibleForGrapple(token, target) {
        const tokenSize = token.actor.system.traits.size;
        const targetSize = target.actor.system.traits.size;
        const tokenSizeNum = Object.keys(CONFIG.DND5E.actorSizes).indexOf(tokenSize);
        const targetSizeNum = Object.keys(CONFIG.DND5E.actorSizes).indexOf(targetSize);

        if (targetSizeNum - tokenSizeNum > 1) {
            ui.notifications.warn(`${item.name} creature size difference too great ${token.name}:${CONFIG.DND5E.actorSizes[tokenSize]} vs ${target.name}:${CONFIG.DND5E.actorSizes[targetSize]}`)
            return false;
        }

        return true;
    }

    static isAvailableThisTurn(actor, flagName) {
        if (game.combat) {
            const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn / 100}`;
            const lastTime = actor.getFlag("fvtt-trazzm-homebrew-5e", flagName);
            if (combatTime === lastTime) {
                return false;
            }
            return true;
        }

        return false;
    }

    static async setUsedThisTurn(actor, flagName) {
        const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn / 100}`;
        const lastTime = actor.getFlag("fvtt-trazzm-homebrew-5e", flagName);
        if (combatTime !== lastTime) {
            await actor.setFlag("fvtt-trazzm-homebrew-5e", flagName, combatTime)
        }
    }

    static async dialog(title, options) {
        let buttons = options.map(([label, value]) => ({label, value}));
        let selected = await HomebrewHelpers.buttonDialog(
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
        return await HomebrewHelpers.menu(
            {
                'inputs': inputs,
                'buttons': buttons
            },
            config
        );
    };

    static findEffect(actor, name, origin = undefined) {
        if (origin) {
            return actor.getRollData().effects.find(eff => eff.name === name && eff.origin === origin);
        }
        else {
            return actor.getRollData().effects.find(eff => eff.name === name);
        }
    };

    static findEffectStartsWith(actor, name, origin = undefined) {
        if (origin) {
            return actor.getRollData().effects.find(eff => eff.name.startsWith(name) && eff.origin === origin);
        }
        else {
            return actor.getRollData().effects.find(eff => eff.name.startsWith(name));
        }
    };

    static async updateEffect(effect, updates) {
        if (game.user.isGM) {
            await effect.update(updates);
        } else {
            updates._id = effect.id;
            await MidiQOL.socket().executeAsGM('updateEffects', {
                'actorUuid': effect.parent.uuid,
                'updates': [updates]
            });
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

    static naturalReach(actor) {
        // 'flags.midi-qol.range.mwak'
        let reach = 5;
        if (actor) {
            for (let effect of actor.getRollData().effects) {
                const reachChange = effect.changes.find(change => change.key === 'flags.midi-qol.range.mwak');
                if (reachChange) {
                    if (reachChange.mode === CONST.ACTIVE_EFFECT_MODES.ADD) {
                        var value = Number(reachChange.value);
                        reach += value;
                    }
                }
            }
        }

        return reach;
    }

    static raceOrType(actor) {
        return actor.type === "npc" ? actor.system.details?.type?.value : actor.system.details?.race;
    };

    static async rollAbilityCheck(actor, ability) {
        if (CONFIG.DND5E.abilities[ability]) {
            let rolled = await actor.rollAbilityTest(ability);
            return rolled.total;
        }
        else {
            let rolled = await actor.rollSkill(ability);
            return rolled.total;
        }
    }

    static maxMovementRate(actor) {
        return Math.max(actor.system.attributes.movement.walk,
            actor.system.attributes.movement.fly,
            actor.system.attributes.movement.climb,
            actor.system.attributes.movement.burrow);
    }

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
        } else {
            ui.notifications.warn('Pack not found in compendium!');
            return undefined;
        }
    }

    static syntheticItemWorkflowOptions(targets, useSpellSlot, castLevel, consume = undefined) {
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
                    'autoRollDamage': 'onHit',
                    'autoFastDamage': true
                }
            }
        ];
    }

    static hasConditionImmunity(actor, conditionType) {
        if (!actor || !conditionType)
            return false;

        return actor.system.traits.ci?.value?.has(conditionType);
    }

    static hasSaveAdvantage(actor, conditionType) {
        return HomebrewHelpers.hasResilience(actor, conditionType);
    }

    static hasResilience(actor, conditionType) {
        // sanity checks
        if (!actor) {
            console.error("fvtt-trazzm-homebrew-5e | ", "hasResilience() - No actor specified");
            return false;
        }

        if (!conditionType || conditionType.length === 0) {
            console.error("fvtt-trazzm-homebrew-5e | ", "hasResilience() - No conditionType specified");
            return false;
        }

        let ct = conditionType.toLowerCase();
        switch (ct) {
            case "blind":
            case "blinded":
                let blindFeature = actor.items.find(f => _blindedResistLabels.has(f.name.toLowerCase()));
                if (blindFeature) {
                    return true;
                } else {
                    let blindFeature = actor.getRollData().effects.find(f => _blindedResistLabels.has(f.name.toLowerCase()));
                    if (blindFeature) {
                        return true;
                    }
                }
                break;
            case "charm":
            case "charmed":
                let charmFeature = actor.items.find(f => _charmResistLabels.has(f.name.toLowerCase()));
                if (charmFeature) {
                    return true;
                } else {
                    let charmEffect = actor.getRollData().effects.find(f => _charmResistLabels.has(f.name.toLowerCase()));
                    if (charmEffect) {
                        return true;
                    }
                }
                break;
            case "deaf":
            case "deafened":
                let deafFeature = actor.items.find(f => _deafenedResistLabels.has(f.name.toLowerCase()));
                if (deafFeature) {
                    return true;
                } else {
                    let deafFeature = actor.getRollData().effects.find(f => _deafenedResistLabels.has(f.name.toLowerCase()));
                    if (deafFeature) {
                        return true;
                    }
                }
                break;
            case "fear":
            case "fright":
            case "frightened":
                let frightFeature = actor.items.find(f => _frightenedResistLabels.has(f.name.toLowerCase()));
                if (frightFeature) {
                    return true;
                } else {
                    let frightEffect = actor.getRollData().effects.find(f => _frightenedResistLabels.has(f.name.toLowerCase()));
                    if (frightEffect) {
                        return true;
                    }
                }
                break;
            case "paralyze":
            case "paralyzed":
            case "paralysis":
                let paralyzeFeature = actor.items.find(f => _paralyzedResistLabels.has(f.name.toLowerCase()));
                if (paralyzeFeature) {
                    return true;
                } else {
                    let paralyzeEffect = actor.getRollData().effects.find(f => _paralyzedResistLabels.has(f.name.toLowerCase()));
                    if (paralyzeEffect) {
                        return true;
                    }
                }
                break;
            case "poison":
            case "poisoned":
                let poisonFeature = actor.items.find(f => _poisonResistItems.has(f.name.toLowerCase()));
                if (poisonFeature) {
                    return true;
                } else {
                    let poisonEffect = actor.getRollData().effects.find(f => _poisonResistEffects.has(f.name.toLowerCase()));
                    if (poisonEffect) {
                        return true;
                    }
                }
                break;
            case "prone":
                let proneFeature = actor.items.find(f => _proneResistLabels.has(f.name.toLowerCase()));
                if (proneFeature) {
                    return true;
                } else {
                    let proneEffect = actor.getRollData().effects.find(f => _proneResistLabels.has(f.name.toLowerCase()));
                    if (proneEffect) {
                        return true;
                    }
                }
                break;
            case "asleep":
            case "sleep":
                let sleepFeature = actor.items.find(f => _sleepResistLabels.has(f.name.toLowerCase()));
                if (sleepFeature) {
                    return true;
                } else {
                    let sleepEffect = actor.getRollData().effects.find(f => _sleepResistLabels.has(f.name.toLowerCase()));
                    if (sleepEffect) {
                        return true;
                    }
                }
                break;
            case "stun":
            case "stunned":
                let stunFeature = actor.items.find(f => _stunResistLabels.has(f.name.toLowerCase()));
                if (stunFeature) {
                    return true;
                } else {
                    let stunEffect = actor.getRollData().effects.find(f => _stunResistLabels.has(f.name.toLowerCase()));
                    if (stunEffect) {
                        return true;
                    }
                }
                break;
        }

        return false;
    }

    static hasTurnImmunity(actor) {
        if (!actor)
            return false;

        let feature = actor.items.find(f => _turnImmunityLabels.has(f.name.toLowerCase()));
        if (feature) {
            return true;
        } else {
            feature = actor.getRollData().effects.find(f => _turnImmunityLabels.has(f.name.toLowerCase()));
            if (feature) {
                return true;
            }
        }

        return false;
    }

    static hasTurnResistance(actor) {
        if (!actor)
            return false;

        let feature = actor.items.find(f => _turnResistLabels.has(f.name.toLowerCase()));
        if (feature) {
            return true;
        } else {
            feature = actor.getRollData().effects.find(f => _turnResistLabels.has(f.name.toLowerCase()));
            if (feature) {
                return true;
            }
        }

        return false;
    }

    static getAvailableSorceryPoints(actor) {
        let usesLeft = 0;

        if (actor) {
            let fontOfMagic = actor.items.find(i => i.name === "Font of Magic");
            if (fontOfMagic) {
                usesLeft += fontOfMagic.system.uses?.value ?? 0;
            }

            let metaMagicAdept = actor.items.find(i => i.name === "Metamagic Adept");
            if (metaMagicAdept) {
                usesLeft += metaMagicAdept.system.uses?.value ?? 0;
            }
        }

        return usesLeft;
    }

    static async reduceAvailableSorceryPoints(actor, points) {
        let cost = points ? points : 1;

        if (actor) {
            let metaMagicAdept = actor.items.find(i => i.name === "Metamagic Adept");
            if (metaMagicAdept) {
                let spent = metaMagicAdept.system.uses?.spent ?? 0;
                let max = metaMagicAdept.system.uses?.max ?? 0;
                if ((spent + cost) <= max) {
                    const newValue = metaMagicAdept.system.uses.spent + cost;
                    await metaMagicAdept.update({"system.uses.spent": newValue});
                    return true;
                }
                else if ((max - spent) > 0) {
                    await metaMagicAdept.update({"system.uses.spent": max});
                    cost -= (max - spent);
                }
            }

            let fontOfMagic = actor.items.find(i => i.name === "Font of Magic");
            if (fontOfMagic) {
                let spent = fontOfMagic.system.uses?.spent ?? 0;
                let max = fontOfMagic.system.uses?.max ?? 0;
                if ((spent + cost) <= max) {
                    const newValue = fontOfMagic.system.uses.spent + cost;
                    await fontOfMagic.update({"system.uses.spent": newValue});
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Gets the applied enchantments for the specified item or activity uuid if any exist.
     *
     * @param {string} entityUuid - The UUID of the item or activity for which to find associated enchantments.
     * @returns {ActiveEffect5e[]} list of applied enchantments.
     */
    static async getAppliedEnchantments(entityUuid) {
        return dnd5e.registry.enchantments.applied(entityUuid);
    }

    /**
     * Deletes the applied enchantments for the specified item or activity uuid.
     *
     * @param {string} entityUuid - The UUID of the item or activity for which to delete the associated enchantments.
     * @returns {ActiveEffect5e[]} the list of applied enchantments that was deleted.
     */
    static async deleteAppliedEnchantments(entityUuid) {
        const appliedEnchantements = getAppliedEnchantments(entityUuid);
        for (let activeEffect of appliedEnchantements) {
            await activeEffect.delete();
        }
        return appliedEnchantements;
    }

    static async menu(prompts = {}, config = {}) {
        /* apply defaults to optional params */
        const configDefaults = {
            title: "Prompt",
            defaultButton: "Ok",
            render: null,
            close: (resolve) => resolve({ buttons: false }),
            options: {},
        };

        const { title, defaultButton, render, close, checkedText, options } =
            foundry.utils.mergeObject(configDefaults, config);
        const { inputs, buttons } = foundry.utils.mergeObject(
            { inputs: [], buttons: [] },
            prompts
        );

        return await new Promise((resolve) => {
            let content = HomebrewHelpers.dialogInputs(inputs);

            /** @type Object<string, object> */
            let buttonData = {};
            let def = buttons.at(-1)?.label;
            buttons.forEach((button) => {
                if ("default" in button) def = button.label;
                buttonData[button.label] = {
                    label: button.label,
                    callback: (html) => {
                        const results = {
                            inputs: HomebrewHelpers._innerValueParse(inputs, html, {checkedText}),
                            buttons: button.value,
                        };                        if (button.callback instanceof Function)
                            button.callback(results, html);
                        return resolve(results);
                    },
                };
            });

            /* insert standard submit button if none provided */
            if (buttons.length < 1) {
                def = defaultButton;
                buttonData = {
                    [defaultButton]: {
                        label: defaultButton,
                        callback: (html) =>
                            resolve({
                                inputs: HomebrewHelpers._innerValueParse(inputs, html, {checkedText}),
                                buttons: true,
                            }),
                    },
                };
            }

            new Dialog(
                {
                    title,
                    content,
                    default: def,
                    close: (...args) => close(resolve, ...args),
                    buttons: buttonData,
                    render,
                },
                { focus: true, ...options }
            ).render(true);
        });
    }

    static dialogInputs = (data) => {
        /* correct legacy input data */
        data.forEach((inputData) => {
            if (inputData.type === "select") {
                inputData.options.forEach((e, i) => {
                    switch (typeof e) {
                        case "string":
                            /* if we are handed legacy string values, convert them to objects */
                            inputData.options[i] = { value: e, html: e };
                        /* fallthrough to tweak missing values from object */

                        case "object":
                            /* if no HMTL provided, use value */
                            inputData.options[i].html ??= inputData.options[i].value;

                            /* sanity check */
                            if (
                                !!inputData.options[i].html &&
                                inputData.options[i].value != undefined
                            ) {
                                break;
                            }

                        /* fallthrough to throw error if all else fails */
                        default: {
                            const emsg = "dialogInputs: bad select options";
                            console.error(emsg);
                            throw new Error(emsg);
                        }
                    }
                });
            }
        });

        const mapped = data
            .map(({ type, label, options }, i) => {
                type = type.toLowerCase();
                switch (type) {
                    case "header":
                        return `<tr><td colspan = "2"><h2>${label}</h2></td></tr>`;
                    case "button":
                        return "";
                    case "info":
                        return `<tr><td colspan="2">${label}</td></tr>`;
                    case "select": {
                        const optionString = options
                            .map((e, i) => {
                                return `<option value="${i}" ${e.selected ? 'selected' : ''}>${e.html}</option>`;
                            })
                            .join("");

                        return `<tr><th style="width:50%"><label for="${i}qd">${label}</label></th><td style="width:50%"><select id="${i}qd">${optionString}</select></td></tr>`;
                    }
                    case "radio":
                        return `<tr><th style="width:50%"><label for="${i}qd">${label}</label></th><td style="width:50%"><input type="${type}" id="${i}qd" ${
                            (options instanceof Array ? options[1] : false )
                                ? "checked"
                                : ""
                        } value="${i}" name="${
                            options instanceof Array ? options[0] : options ?? "radio"
                        }"/></td></tr>`;
                    case "checkbox":
                        return `<tr><th style="width:50%"><label for="${i}qd">${label}</label></th><td style="width:50%"><input type="${type}" id="${i}qd" ${
                            (options instanceof Array ? options[0] : options ?? false)
                                ? "checked"
                                : ""
                        } value="${i}"/></td></tr>`;
                    default:
                        return `<tr><th style="width:50%"><label for="${i}qd">${label}</label></th><td style="width:50%"><input type="${type}" id="${i}qd" value="${
                            options instanceof Array ? options[0] : options
                        }"/></td></tr>`;
                }
            })
            .join(``);

        const content = `
            <table style="width:100%">
              ${mapped}
            </table>`;

        return content;
    };

    static _innerValueParse(data, html, {checkedText = false}) {
        return Array(data.length)
            .fill()
            .map((e, i) => {
                let { type } = data[i];
                if (type.toLowerCase() === `select`) {
                    return data[i].options[html.find(`select#${i}qd`).val()].value;
                } else {
                    switch (type.toLowerCase()) {
                        case `text`:
                        case `password`:
                            return html.find(`input#${i}qd`)[0].value;
                        case `radio`:
                        case `checkbox`: {
                            const ele = html.find(`input#${i}qd`)[0];

                            if (checkedText) {
                                const label = html.find(`[for="${i}qd"]`)[0];
                                return ele.checked ? label.innerText : '';
                            }

                            return ele.checked;
                        }
                        case `number`:
                            return html.find(`input#${i}qd`)[0].valueAsNumber;
                    }
                }
            });
    }

    /**
     * Helper function for quickly creating a simple dialog with labeled buttons and associated data.
     *
     * @param {Object} data
     * @param {Array<{label: string, value:*}>} data.buttons
     * @param {string} [data.title]
     * @param {string} [data.content]
     * @param {Object} [data.options]
     *
     * @param {string} [direction = 'row'] 'column' or 'row' accepted. Controls layout direction of dialog.
     */
    static async buttonDialog(data, direction = "row") {
        return await new Promise(async (resolve) => {
            // @type Object<string, object>
            let buttons = {},
                dialog;

            data.buttons.forEach((button) => {
                buttons[button.label] = {
                    label: button.label,
                    callback: () => resolve(button.value),
                };
            });

            dialog = new Dialog(
                {
                    title: data.title ?? "",
                    content: data.content ?? "",
                    buttons,
                    close: () => resolve(false),
                },
                {
                    /*width: '100%',*/
                    height: "100%",
                    ...data.options,
                }
            );

            await dialog._render(true);
            dialog.element.find(".dialog-buttons").css({
                "flex-direction": direction,
            });
        });
    }

    static getLevelOrCR(actor) {
        if (actor.type === "character") {
            return actor.system.details.level;
        }

        return actor.system.details.cr;
    }

    static updateTargets(newTargets) {
        game.user.updateTokenTargets(Array.from(newTargets).map(target => target.id ?? target));
        game.user.broadcastActivity({targets: game.user.targets.ids});
    }

    static async addFavorite(actor, item) {
        // sanity checks
        if (actor && item) {
            let favorites = foundry.utils.deepClone(actor.system.favorites);
            favorites.push({type: "item", id: item.getRelativeUUID(actor)});
            await actor.update({ "system.favorites": favorites });
        }
    }

    static async rechargeLegendaryActions(actor) {
        // skip if dead
        const hpValue = foundry.utils.getProperty(actor, 'system.attributes.hp.value');
        if (!hpValue || hpValue < 1)
            return;

        let legendaryResource = foundry.utils.getProperty(actor, 'system.resources.legact');
        if (legendaryResource && (legendaryResource.max > 0) && (legendaryResource.value < legendaryResource.max)) {
            await actor.update({'system.resources.legact.value' : legendaryResource.max});
        }
    }

    static async selectAbilityDialog(title) {
        const field = new foundry.data.fields.StringField({
            required: true,
            label: "Ability",
            choices: CONFIG.DND5E.abilities
        });

        const content = `<fieldset>${field.toFormGroup({}, {name: "ability"}).outerHTML}</fieldset>`;

        await foundry.applications.api.DialogV2.prompt({
            content: content,
            rejectClose: false,
            ok: {
                callback: (event, button) => {
                    return button.form.elements.ability.value;
                }
            },
            window: {
                title: title
            },
            position: {
                width: 400
            }
        });
    }

    static itemDurationSeconds(item) {
        let duration = 60;
        let d = item.system.duration;
        if (d.units === "second") {
            duration = d.value;
        }
        else if (d.units === "minute") {
            duration = d.value * 60;
        }
        else if (d.units === "hour") {
            duration = d.value * 3600;
        }

        return duration;
    }

    static itemRemainingDurationSeconds(item, startRound, currentRound) {
        let duration = this.itemDurationSeconds(item);
        duration -= ((currentRound - startRound) * 6);
        return duration;
    }

    static async storeSpellDataInRegion(templateId, casterToken, castLevel, actorFlag, regionFlag) {
        let templateDoc = canvas.scene.collections.templates.get(templateId);
        if (templateDoc) {
            const templateRegionId = templateDoc.flags['region-attacher']?.attachedRegion;
            if (templateRegionId) {
                const templateRegion = canvas.scene?.regions?.get(templateRegionId.substring(templateRegionId.lastIndexOf(".") + 1));
                if (templateRegion) {
                    // store the spell data in the region
                    const spelldc = casterToken.actor.system.attributes.spelldc ?? 12;

                    await templateRegion.setFlag('world', regionFlag, {
                        castLevel: castLevel,
                        saveDC: spelldc,
                        sourceTokenId: casterToken.id
                    });

                    await casterToken.actor.setFlag("fvtt-trazzm-homebrew-5e", actorFlag, {templateId: templateDoc.uuid});
                }
                else {
                    ui.notifications.error(`storeSpellDataInRegion() - unable to find the region`);
                    console.error(`storeSpellDataInRegion() - unable to find the region`);
                }
            }
            else {
                ui.notifications.error(`storeSpellDataInRegion() - unable to find the region id`);
                console.error(`storeSpellDataInRegion() - unable to find the region id`);
            }
        }
        else {
            ui.notifications.error(`storeSpellDataInRegion() - unable to find template by id: ${templateId}`);
            console.error(`storeSpellDataInRegion() - unable to find template by id: ${templateId}`);
        }
    }

    static currentTurn() {
        return game.combat.round + '-' + game.combat.turn;
    }

    static previousTurn() {
        let round = game.combat.round;
        let turn = game.combat.turn;

        if (turn === 0) {
            round--;
            turn = game.combat.turns.length - 1;
        }
        else {
            turn--;
        }
        return round + '-' + turn;
    }

    static inCombat() {
        return !!game.combat;
    }

    static perTurnCheck(entity, name, eventName, ownTurnOnly, tokenId) {
        if (!HomebrewHelpers.inCombat()) return true;
        if (ownTurnOnly && (tokenId !== game.combat.current.tokenId)) return false;

        let checkTurn = HomebrewHelpers.currentTurn();
        if (eventName === 'tokenTurnEnd') {
            checkTurn = HomebrewHelpers.previousTurn();
        }

        let flagValue = entity.flags['fvtt-trazzm-homebrew-5e']?.[name]?.turn;
        return checkTurn !== flagValue;
    }

    static async setTurnCheck(entity, name, reset) {
        let turn = '';
        if (HomebrewHelpers.inCombat() && !reset) turn = game.combat.round + '-' + game.combat.turn;
        await entity.setFlag('fvtt-trazzm-homebrew-5e', name + '.turn', turn);
    }

    static isOwnTurn(token) {
        if (!HomebrewHelpers.inCombat()) return true;
        return token.document.id === game.combat.current.tokenId;
    }

    static isHexed(sourceActor, targetActor) {
        if (sourceActor && targetActor) {
            const originStart = `Actor.${sourceActor.id}.`;
            let hexedEffect = targetActor.getRollData().effects.find(e => e.name.startsWith("Hexed ") && e.origin.startsWith(originStart) && e.statuses.has("cursed"));
            if (hexedEffect) {
                return true;
            }
        }

        return false;
    }
}
