/*
    You know how to strike subtly and exploit a foe’s distraction. Once per turn, you can deal an extra 1d6 damage to
    one creature you hit with an attack roll if you have Advantage on the roll and the attack uses a Finesse or a
    Ranged weapon. The extra damage’s type is the same as the weapon’s type.

    You don’t need Advantage on the attack roll if at least one of your allies is within 5 feet of the target, the ally
    doesn’t have the Incapacitated condition, and you don’t have Disadvantage on the attack roll.

    The extra damage increases as you gain Rogue levels, as shown in the Sneak Attack column of the Rogue Features table.

    Current Sneak Attack Damage: @scale.rogue.sneak-attack
*/
const version = "12.4.0";
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
        const sneakScale = actor.system.scale?.rogue['sneak-attack']; //  ? sneakDamageFormula =
        let sneakDice = sneakScale?.number;
        let sneakDamageFormula = sneakScale?.formula;
        if (!sneakDamageFormula) {
            if (actor.type === "npc") {
                sneakDice = Math.ceil(actor.system.details.cr / 2);
                sneakDamageFormula = `${sneakDice}d6`;
            }
        }

        if (!sneakDamageFormula) {
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
                <div class="flexcol">
                    <div class="flexrow" style=""><p>Use Sneak attack on this attack? [${sneakDamageFormula}]</p></div>
                </div>`;

            if (cunningStrike) {
                let cunningStrikeRows = "";
                cunningStrikeRows += `<div class="flexrow"><label>Poison (Cost: 1d6)</label><input type="checkbox" value="poison" style="margin-right:10px;"/></div>`;
                cunningStrikeRows += `<div class="flexrow"><label>Trip (Cost: 1d6)</label><input type="checkbox" value="trip" style="margin-right:10px;"/></div>`;
                cunningStrikeRows += `<div class="flexrow"><label>Withdraw (Cost: 1d6)</label><input type="checkbox" value="withdraw" style="margin-right:10px;"/></div>`;

                if (supremeSneak) {
                    cunningStrikeRows += `<div class="flexrow"><label>Stealth Attack (Cost: 1d6)</label><input type="checkbox" value="stealthAttack" style="margin-right:10px;"/></div>`;
                }

                if (deviousStrikes) {
                    cunningStrikeRows += `<div class="flexrow"><label>Daze (Cost: 2d6)</label><input type="checkbox" value="daze" style="margin-right:10px;"/></div>`;
                    cunningStrikeRows += `<div class="flexrow"><label>Knock Out (Cost: 6d6)</label><input type="checkbox" value="knockout" style="margin-right:10px;"/></div>`;
                    cunningStrikeRows += `<div class="flexrow"><label>Obscure (Cost: 3d6)</label><input type="checkbox" value="obscure" style="margin-right:10px;"/></div>`;
                }

                content += `
                    <div class="flexcol">
                        <div class="flexrow" style="">
                            <p>Select up to ${maxOptions} Cunning Strike option(s):</p>
                        </div>
                        <div class="flexrow" style="margin-bottom: 10px;">
                            <sub>(activate these features after a successfull sneak attack)</sub>
                        </div>
                        <div id="cunningStrikeOptions" class="flexcol" style="margin-bottom: 10px;">
                            ${cunningStrikeRows}
                        </div>
                    </div>                    
                `;
            }
            content += '</form>';

            // show dialog
            let cunningStrikeCost = 0;

            let sneakOptions = await foundry.applications.api.DialogV2.prompt({
                content: content,
                rejectClose: false,
                ok: {
                    callback: (event, button, dialog) => {
                        // check the cunning strike options count
                        let cunningStrikeChoices = [];

                        var grid = document.getElementById("cunningStrikeOptions");
                        var checkBoxes = grid.getElementsByTagName("INPUT");
                        for (var i = 0; i < checkBoxes.length; i++) {
                            if (checkBoxes[i].checked) {
                                cunningStrikeChoices.push(checkBoxes[i].value);
                                cunningStrikeCost += cunningStrikeCosts[checkBoxes[i].value];
                            }
                        }

                        if ((cunningStrikeChoices.length > maxOptions) || (cunningStrikeCost > sneakDice)) {
                            ui.notifications.error(`${optionName}: ${version} - too many or too costly of cunning strike options selected`);
                            return { useSneak: true, options: []};
                        }

                        return { useSneak: true, options: cunningStrikeChoices};
                    }
                },
                window: {
                    title: `${optionName}`,
                },
                position: {
                    width: 500
                }
            });

            if (sneakOptions && sneakOptions.useSneak) {
                await HomebrewHelpers.setUsedThisTurn(actor, timeFlag);

                // handle the cunning strike options
                if (sneakOptions.options.length > 0) {
                    sneakDamageFormula = `${sneakDice - cunningStrikeCost}d6`;

                    ChatMessage.create({
                        content: `Selected Cunning Strike options: ${sneakOptions.options}, reducing sneak attack damage dice by ${cunningStrikeCost}`,
                        speaker: ChatMessage.getSpeaker({actor: actor})
                    });
                }

                // return the damage
                return new CONFIG.Dice.DamageRoll(`${sneakDamageFormula}[Sneak]`, {}, {type:workflow.defaultDamageType, properties: [...rolledItem.system.properties]});
            }
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

// Check if there is an enemy of the target adjacent to it
function checkAllyNearTarget(rogueToken, targetToken) {
    let foundEnemy = false;
    let nearbyEnemy = canvas.tokens.placeables.filter(t => {
        let nearby = (t.actor &&
            t.actor?.id !== rogueToken.actor._id && // not me
            t.id !== targetToken.id && // not the target
            t.actor?.system.attributes?.hp?.value > 0 && // not incapacitated
            t.document.disposition !== targetToken.document.disposition && // not an ally
            MidiQOL.computeDistance(t, targetToken, {wallsBlock: false}) <= 5 // close to the target
        );
        foundEnemy = foundEnemy || (nearby && t.document.disposition === -targetToken.document.disposition)
        return nearby;
    });

    return (nearbyEnemy.length > 0);
}
