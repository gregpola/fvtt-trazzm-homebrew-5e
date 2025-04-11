/*
    Once per turn when you hit a creature with your pact weapon, you can deal an extra 1d6 Necrotic, Psychic, or Radiant
    damage (your choice) to the creature, and you can expend one of your Hit Point Dice to roll it and regain a number
    of Hit Points equal to the roll plus your Constitution modifier (minimum of 1 Hit Point).

    The healing is handled by an activity
 */
const version = "12.4.0";
const optionName = "Lifedrinker";
const timeFlag = "last-lifedrinker";

try {
    if (args[0].macroPass === "DamageBonus") {
        if (!workflow.hitTargets.size) return {};
        if (rolledItem.type !== "weapon") return {}

        // make sure it's the actor's pact weapon
        const pactWeapon = rolledItem.effects.find(eff => eff.name === "Pact Weapon");
        if (!pactWeapon) return {};

        if (HomebrewHelpers.isAvailableThisTurn(actor, timeFlag) && game.combat) {
            let content = `<p>Apply ${optionName} to this attack?</p>` +
                `<sub>Once per turn, when you hit a creature with your pact weapon, you can deal an extra 1d6 Necrotic, Psychic, or Radiant damage.</sub>` +
                `<p>Select the damage type:</p>` +
                `<label style="margin-bottom: 10px;"><input style="right: 10px;" type="radio" name="choice" value="necrotic" checked />Necrotic</label>` +
                `<label style="margin-bottom: 10px;"><input style="right: 10px;" type="radio" name="choice" value="psychic" />Psychic</label>` +
                `<label style="margin-bottom: 10px;"><input style="right: 10px;" type="radio" name="choice" value="radiant" />Radiant</label>`+
                `<div class="flexrow"><label>Knock Prone?</label><input type="checkbox" value=${t.actor.uuid} style="margin-right:10px;"/></div>`;

            // ask if they want to use the option
            const damageType = await foundry.applications.api.DialogV2.prompt({
                content: content,
                rejectClose: false,
                ok: {
                    callback: (event, button, dialog) => {
                        return button.form.elements.choice.value;
                    }
                },
                window: {
                    title: `${optionName}`,
                },
                position: {
                    width: 400
                }
            });

            if (damageType) {
                await HomebrewHelpers.setUsedThisTurn(actor, timeFlag);
                return new CONFIG.Dice.DamageRoll('1d6[Lifedrinker]', {}, {
                    type: damageType,
                    properties: [...rolledItem.system.properties]
                });
            }
        }

        return {};
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
