/*
    You know how to strike subtly and exploit a foe’s distraction. Once per turn, you can deal an extra 1d6 damage to
    one creature you hit with an attack roll if you have Advantage on the roll and the attack uses a Finesse or a
    Ranged weapon. The extra damage’s type is the same as the weapon’s type.

    You don’t need Advantage on the attack roll if at least one of your allies is within 5 feet of the target, the ally
    doesn’t have the Incapacitated condition, and you don’t have Disadvantage on the attack roll.
*/
const version = "12.4.0";
const optionName = "Sneak Attack";
const timeFlag = "last-sneak-attack";

const combatTime = game.combat ? `${game.combat.id}-${game.combat.round + game.combat.turn / 100}` : 1;

try {
    if (args[0].macroPass === "DamageBonus") {
        // must be a hit
        if (!workflow.hitTargets.size) return {};

        // must be a finesse or ranged weapon
        if (!["mwak","rwak"].includes(workflow.activity.actionType)) return {};
        if (workflow.activity.actionType === "mwak" && !rolledItem?.system.properties?.has("fin")) return {};

        // check for sneak attack dice
        let sneakDice = 1;
        let sneakDamageFormula = '1d6';
        if (actor.system.scale && actor.system.scale.rogue) {
            sneakDice = actor.system.scale.rogue['sneak-attack'].number;
            sneakDamageFormula = actor.system.scale.rogue['sneak-attack'].formula;
        }
        else if (actor.type === "npc") {
            sneakDice = Math.ceil(actor.system.details.cr / 2);
            sneakDamageFormula = `${sneakDice}d6`;
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

            if (!isSneak) {
                console.debug(`${optionName} - attack not eligible for sneak attack`);
                return {};
            }

            // ask if they want to use sneak attack, and if so which Cunning/Devious Strikes to use
            let content = `
              <form>
                <div class="flexcol">
                    <div class="flexrow" style=""><p>Use Sneak attack on this attack? [${sneakDamageFormula}]</p></div>
                </div>
              </form>`;

            // show dialog
            let sneakOptions = await foundry.applications.api.DialogV2.prompt({
                content: content,
                rejectClose: false,
                ok: {
                    callback: (event, button, dialog) => {
                        return { useSneak: true};
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
