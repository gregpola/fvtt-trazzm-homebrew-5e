/*
    You know how to strike subtly and exploit a foe’s distraction. Once per turn, you can deal an extra 1d6 damage to
    one creature you hit with an attack roll if you have Advantage on the roll and the attack uses a Finesse or a
    Ranged weapon. The extra damage’s type is the same as the weapon’s type.

    You don’t need Advantage on the attack roll if at least one of your allies is within 5 feet of the target, the ally
    doesn’t have the Incapacitated condition, and you don’t have Disadvantage on the attack roll.

    The extra damage increases as you gain Rogue levels, as shown in the Sneak Attack column of the Rogue Features table.

    Current Sneak Attack Damage: @scale.rogue.sneak-attack
*/
const version = "12.4.4";
const optionName = "Sneak Attack";
const timeFlag = "last-sneak-attack";

const cunningStrikeCosts = {
    poison: 1,
    trip: 1,
    withdraw: 1,
    stealthAttack: 1,
    daze: 2,
    knockout: 6,
    obscure: 3
}

const combatTime = game.combat ? `${game.combat.id}-${game.combat.round + game.combat.turn / 100}` : 1;

try {
    if (args[0].macroPass === "DamageBonus") {
        // must be a hit
        if (!workflow.hitTargets.size) return {};

        // must be a finesse or ranged weapon
        if (!["mwak","rwak"].includes(workflow.activity.actionType)) return {};
        if (workflow.activity.actionType === "mwak" && !rolledItem?.system.properties?.has("fin")) return {};

        // check for sneak attack dice
        let sneakDice = 0;
        let sneakDie = 'd6';
        let sneakDieFaces = 6;

        if (actor.system.scale && actor.system.scale.rogue) {
            sneakDice = actor.system.scale.rogue['sneak-attack'].number;
            sneakDie = actor.system.scale.rogue['sneak-attack'].die;
            sneakDieFaces = actor.system.scale.rogue['sneak-attack'].faces;
        }
        else if (actor.type === "npc") {
            sneakDice = Math.ceil(actor.system.details.cr / 2);
        }

        if (!sneakDice) {
            console.debug(`${optionName} - no rogue levels`);
            return {};
        }

        // Once per turn
        if (HomebrewHelpers.isAvailableThisTurn(actor, timeFlag) && game.combat) {
            let targetToken = workflow.hitTargets.first();

            // Determine if the attack is eligible for Sneak Attack
            let isSneak = workflow.advantage;

            if (!isSneak && checkAllyNearTarget(token, targetToken)) {
                // adjacent enemy
                isSneak = !workflow.disadvantage;
            }

            // TODO handle other subclass options

            if (!isSneak) {
                console.debug(`${optionName} - attack not eligible for sneak attack`);
                return {};
            }

            // get *strike features
            const cunningStrike = actor.items.find(i => i.name === "Cunning Strike");
            const improvedCunningStrike = actor.items.find(i => i.name === "Improved Cunning Strike");
            const deviousStrikes = actor.items.find(i => i.name === "Devious Strikes");
            const supremeSneak = actor.items.find(i => i.name === "Supreme Sneak");
            const maxOptions = improvedCunningStrike ? 2 : 1;

            // ask if they want to use sneak attack, and if so which Cunning/Devious Strikes to use
            let content = `
              <form>
                <div><strong><label>Use Sneak attack on this attack? [${sneakDice}${sneakDie}]</label></strong></div>
                <hr />`;

            if (cunningStrike) {
                let cunningStrikeRows = "";
                cunningStrikeRows += `<div><input type="checkbox" value="poison" style="margin-left:10px;" /><label style="margin-left: 10px;">Poison (Cost: 1d6)</label></div>`;
                cunningStrikeRows += `<div><input type="checkbox" value="trip" style="margin-left:10px;" /><label style="margin-left: 10px;">Trip (Cost: 1d6)</label></div>`;
                cunningStrikeRows += `<div><input type="checkbox" value="withdraw" style="margin-left:10px;" /><label style="margin-left: 10px;">Withdraw (Cost: 1d6)</label></div>`;

                if (supremeSneak) {
                    cunningStrikeRows += `<div><input type="checkbox" value="stealthAttack" style="margin-right:10px;" /><label style="margin-left: 10px;">Stealth Attack (Cost: 1d6)</label></div>`;
                }

                if (deviousStrikes) {
                    cunningStrikeRows += `<div><input type="checkbox" value="daze" style="margin-left:10px;" /><label style="margin-left: 10px;">Daze (Cost: 2d6)</label></div>`;
                    cunningStrikeRows += `<div><input type="checkbox" value="knockout" style="margin-left:10px;" /><label style="margin-left: 10px;">Knock Out (Cost: 6d6)</label></div>`;
                    cunningStrikeRows += `<div><input type="checkbox" value="obscure" style="margin-left:10px;" /><label style="margin-left: 10px;">Obscure (Cost: 3d6)</label></div>`;
                }

                content += `<div style="margin-bottom: 10px;"><strong><label>Select up to ${maxOptions} Cunning Strike option(s):</label></strong></div>`;
                content += `<div id="cunningStrikeOptions" class="flexcol" style="margin-bottom: 5px;"> ${cunningStrikeRows}</div>`;
                content += `<div style="margin-bottom: 10px;"><sub>(these options reduce the sneak attack damage by the number of dice noted)</sub></div>`;
            }
            content += '</form>';

            // show dialog
            let cunningStrikeCost = 0;

            const sneakOptions = await foundry.applications.api.DialogV2.wait({
                window: { title: `${optionName}` },
                form: { closeOnSubmit: true },
                content: content,
                buttons: [
                    {
                        action: "Cast",
                        default: true,
                        label: "Use Sneak Attack",
                        callback: (event, button, dialog) => {
                            // check the cunning strike options count
                            let cunningStrikeChoices = [];

                            var grid = document.getElementById("cunningStrikeOptions");
                            if (grid) {
                                var checkBoxes = grid.getElementsByTagName("INPUT");
                                for (var i = 0; i < checkBoxes.length; i++) {
                                    if (checkBoxes[i].checked) {
                                        cunningStrikeChoices.push(checkBoxes[i].value);
                                        cunningStrikeCost += cunningStrikeCosts[checkBoxes[i].value];
                                    }
                                }
                            }

                            if ((cunningStrikeChoices.length > maxOptions) || (cunningStrikeCost > sneakDice)) {
                                ui.notifications.error(`${optionName}: ${version} - too many or too costly of cunning strike options selected`);
                                return { useSneak: true, options: []};
                            }

                            return { useSneak: true, options: cunningStrikeChoices};
                        }
                    },
                    {
                        action: "Pass",
                        default: false,
                        label: "Pass",
                        callback: () => "Pass"
                    },
                ],
                rejectClose: false,
                modal: true
            });

            if (sneakOptions && sneakOptions.useSneak) {
                // handle subclass features
                const assassinate = actor.items.find(i => i.name === "Assassinate");
                const deathStrike = actor.items.find(i => i.name === "Death Strike");
                let rogueLevels = actor.getRollData().classes?.rogue?.levels ?? 0;
                const saveDC = 8 + actor.system.abilities.dex.mod + actor.system.attributes.prof;

                // Death Strike -->
                // When you hit with your Sneak Attack on the first round of a combat, the target must succeed on a
                // Constitution saving throw (DC 8 plus your Dexterity modifier and Proficiency Bonus), or the attack’s
                // damage is doubled against the target.
                let applyDeathStrike = (deathStrike && game.combat.round === 1);

                if (applyDeathStrike) {
                    // roll save
                    const config = { undefined, ability: "con", target: saveDC };
                    const dialog = {};
                    const message = { data: { speaker: ChatMessage.implementation.getSpeaker({ actor: targetToken.actor }) } };
                    let saveResult = await targetToken.actor.rollSavingThrow(config, dialog, message);
                    if (saveResult[0].isSuccess) {
                        applyDeathStrike = false;
                    }
                }

                // handle the cunning strike options
                if (sneakOptions.options.length > 0) {
                    sneakDice -= cunningStrikeCost;
                    ChatMessage.create({
                        content: `Selected Cunning Strike options: ${sneakOptions.options}, reducing sneak attack damage dice by ${cunningStrikeCost}`,
                        speaker: ChatMessage.getSpeaker({actor: actor})
                    });

                    for (let cs of sneakOptions.options) {
                        switch(cs) {
                            case "poison":
                                await handleCunningStrikePoison(actor, targetToken, saveDC);
                                break;
                            case "trip":
                                await handleCunningStrikeTrip(actor, targetToken, saveDC);
                                break;
                            case "withdraw":
                                console.log('Cunning Strike - Withdraw');
                                break;
                            case "stealthAttack":
                                // TODO how handle?
                                console.log('Cunning Strike - Stealth Attack');
                                break;
                            case "daze":
                                await handleCunningStrikeDaze(actor, targetToken, saveDC);
                                break;
                            case "knockout":
                                await handleCunningStrikeKnockout(actor, targetToken, saveDC);
                                break;
                            case "obscure":
                                await handleCunningStrikeObscure(actor, targetToken, saveDC);
                                break;
                        }
                    }
                }

                // build the sneak damage formula
                if (applyDeathStrike) {
                    sneakDice *= 2;
                }
                let sneakDamageFormula = `${sneakDice}${sneakDie}`;

                if (assassinate && rogueLevels && game.combat.round === 1) {
                    if (applyDeathStrike) {
                        rogueLevels *= 2;
                    }
                    sneakDamageFormula += ` + ${rogueLevels}`;
                }

                if (applyDeathStrike) {
                    // double the weapon damage
                    workflow.damageRolls.push(...workflow.damageRolls);
                    await workflow.setDamageRolls(workflow.damageRolls);
                }

                await HomebrewHelpers.setUsedThisTurn(actor, timeFlag);

                if (workflow.isCritical) {
                    const critDamage = sneakDice * sneakDieFaces;
                    sneakDamageFormula += ` + ${critDamage}`;
                }

                // return the damage
                return new CONFIG.Dice.DamageRoll(`${sneakDamageFormula}[Sneak]`, {}, {type:workflow.defaultDamageType, properties: [...rolledItem.system.properties]});
            }
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

// Check if there is an ally of the rogue adjacent to the target
function checkAllyNearTarget(rogueToken, targetToken) {
    let nearbyAlly = canvas.tokens.placeables.filter(t => {
        let nearby = (t.actor &&
            t.actor?.id !== rogueToken.actor._id && // not me
            t.id !== targetToken.id && // not the target
            t.actor?.system.attributes?.hp?.value > 0 && // not incapacitated
            t.document.disposition === rogueToken.document.disposition && // an ally
            MidiQOL.computeDistance(t, targetToken, {wallsBlock: false}) <= 5 // close to the target
        );
        return nearby;
    });

    return (nearbyAlly.length > 0);
}

/*
    You add a toxin to your strike, forcing the target to make a Constitution saving throw. On a failed save, the target
    has the Poisoned condition for 1 minute. At the end of each of its turns, the Poisoned target repeats the save,
    ending the effect on itself on a success.

    Envenom Weapons
    When you use the Poison option of your Cunning Strike, the target also takes 2d6 Poison damage whenever it fails the
    saving throw. This damage ignores Resistance to Poison damage.
 */
async function handleCunningStrikePoison(actor, targetToken, saveDC) {
    const envenomWeapons = actor.items.find(i => i.name === "Envenom Weapons");

    // roll save
    const config = {undefined, ability: "con", target: saveDC};
    const dialog = {};
    const message = {data: {speaker: ChatMessage.implementation.getSpeaker({actor: targetToken.actor})}};
    let saveResult = await targetToken.actor.rollSavingThrow(config, dialog, message);

    if (!saveResult[0].isSuccess) {
        let effectValue = `turn=end, saveAbility=con, saveDC=${saveDC}, label=Poisoned`;
        if (envenomWeapons) {
            effectValue += ', damageRoll=2d6, damageType=poison';
        }

        let effectData = {
            name: "Cunning Strike - Poison",
            icon: "icons/skills/melee/blade-tip-acid-poison-green.webp",
            origin: actor.uuid,
            statuses: [
                "poisoned"
            ],
            changes: [
                {
                    key: "flags.midi-qol.OverTime",
                    value: effectValue,
                    mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                    priority: 20
                },
                {
                    key: "system.traits.dr.value",
                    value: "-poison",
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    priority: 21
                }
            ],
            duration: {seconds: 60}
        };
        await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: targetToken.actor.uuid, effects: [effectData]});
        
        // apply the damage this round
        if (envenomWeapons) {
            const damageRoll = await new CONFIG.Dice.DamageRoll("2d6", {}, {type: "poison"}).evaluate();
            await new MidiQOL.DamageOnlyWorkflow(actor, token, null, null, [targetToken], damageRoll, {
                itemCardId: "new",
                itemData: envenomWeapons.toObject()
            });
        }
    }
}

/*
    If the target is Large or smaller, it must succeed on a Dexterity saving throw or have the Prone condition.
 */
async function handleCunningStrikeTrip(actor, targetToken, saveDC) {
    if (["tiny", "sm", "med", "lg"].includes(targetToken.actor.system.traits.size)) {

        // roll save
        const config = {undefined, ability: "dex", target: saveDC};
        const dialog = {};
        const message = {data: {speaker: ChatMessage.implementation.getSpeaker({actor: targetToken.actor})}};
        let saveResult = await targetToken.actor.rollSavingThrow(config, dialog, message);

        if (!saveResult[0].isSuccess) {
            await targetToken.actor.toggleStatusEffect('prone', {active: true});
        }
    }
}

/*
    The target must succeed on a Constitution saving throw, or on its next turn, it can do only one of the following:
    move or take an action or a Bonus Action.
 */
async function handleCunningStrikeDaze(actor, targetToken, saveDC) {
    // roll save
    const config = {undefined, ability: "con", target: saveDC};
    const dialog = {};
    const message = {data: {speaker: ChatMessage.implementation.getSpeaker({actor: targetToken.actor})}};
    let saveResult = await targetToken.actor.rollSavingThrow(config, dialog, message);

    if (!saveResult[0].isSuccess) {
        let effectData = {
            name: "Cunning Strike - Daze",
            icon: "icons/skills/melee/blade-tip-acid-poison-green.webp",
            origin: actor.uuid,
            description: '<p>Target is dazed, they can do only one of the following on their turn: move or take an action or a Bonus Action</p>',
            statuses: [],
            changes: [],
            duration: {seconds: 6},
            flags: {
                dae: {
                    specialDuration: ['shortRest', 'turnEnd', 'combatEnd']
                }
            }
        };

        await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: targetToken.actor.uuid, effects: [effectData]});
    }
}

/*
    The target must succeed on a Constitution saving throw, or it has the Unconscious condition for 1 minute or until it
    takes any damage. The Unconscious target repeats the save at the end of each of its turns, ending the effect on
    itself on a success.
 */
async function handleCunningStrikeKnockout(actor, targetToken, saveDC) {
    // roll save
    const config = {undefined, ability: "con", target: saveDC};
    const dialog = {};
    const message = {data: {speaker: ChatMessage.implementation.getSpeaker({actor: targetToken.actor})}};
    let saveResult = await targetToken.actor.rollSavingThrow(config, dialog, message);

    if (!saveResult[0].isSuccess) {
        let effectData = {
            name: "Cunning Strike - Knockout",
            icon: "icons/skills/melee/blade-tip-acid-poison-green.webp",
            origin: actor.uuid,
            description: '<p>The target must succeed on a Constitution saving throw, or it has the Unconscious condition for 1 minute or until it takes any damage. The Unconscious target repeats the save at the end of each of its turns, ending the effect on itself on a success.</p>',
            statuses: ["unconscious"],
            changes: [
                {
                    key: "flags.midi-qol.OverTime",
                    value: `turn=end, saveAbility=con, saveDC=${saveDC}, label=Knocked Out`,
                    mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                    priority: 20
                }
            ],
            duration: {seconds: 60},
            flags: {
                dae: {
                    specialDuration: ['shortRest', 'isDamaged', 'combatEnd']
                }
            }
        };

        await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: targetToken.actor.uuid, effects: [effectData]});
    }
}

/*
    The target must succeed on a Dexterity saving throw, or it has the Blinded condition until the end of its next turn.
 */
async function handleCunningStrikeObscure(actor, targetToken, saveDC) {
    // roll save
    const config = {undefined, ability: "dex", target: saveDC};
    const dialog = {};
    const message = {data: {speaker: ChatMessage.implementation.getSpeaker({actor: targetToken.actor})}};
    let saveResult = await targetToken.actor.rollSavingThrow(config, dialog, message);

    if (!saveResult[0].isSuccess) {
        let effectData = {
            name: "Cunning Strike - Obscure",
            icon: "icons/skills/melee/blade-tip-acid-poison-green.webp",
            origin: actor.uuid,
            description: '<p>The target must succeed on a Dexterity saving throw, or it has the Blinded condition until the end of its next turn.</p>',
            statuses: ["blinded"],
            changes: [],
            duration: {seconds: 6},
            flags: {
                dae: {
                    specialDuration: ['shortRest', 'turnEnd', 'combatEnd']
                }
            }
        };

        await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: targetToken.actor.uuid, effects: [effectData]});
    }
}
