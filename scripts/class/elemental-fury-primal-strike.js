/*
    Once on each of your turns when you hit a creature with an attack roll using a weapon or a Beast form's attack in
    Wild Shape, you can cause the target to take an extra 1d8 cold, fire, lightning, or thunder damage (choose when you hit).

    @scale.druid.elemental-fury
*/
const version = "12.4.0";
const optionName = "Elemental Fury: Primal Strike";
const timeFlag = "primal-strike-time";

try {
    if (args[0].macroPass === "DamageBonus") {
        if (!workflow.hitTargets.size) return {};

        // Check for availability i.e. once per actors turn
        if (!game.combat || !HomebrewHelpers.isAvailableThisTurn(actor, timeFlag)) {
            console.log(`${optionName}: is not available for this action`);
            return {};
        }

        let damageDice = actor.system.scale.druid['elemental-fury'].die;

        let content = `<p>Apply ${optionName} to this attack?</p>` +
            `<sub>Once per turn, when you hit a creature with an attack roll using a weapon or a Beast form's attack in Wild Shape, you can add ${damageDice} cold, fire, lightning, or thunder damage.</sub>` +
            `<p>Select the damage type:</p>` +
            `<label style="margin-bottom: 10px;"><input style="right: 10px;" type="radio" name="choice" value="cold" checked />Cold</label>` +
            `<label style="margin-bottom: 10px;"><input style="right: 10px;" type="radio" name="choice" value="fire" />Fire</label>` +
            `<label style="margin-bottom: 10px;"><input style="right: 10px;" type="radio" name="choice" value="lightning" />Lightning</label>` +
            `<label style="margin-bottom: 10px;"><input style="right: 10px;" type="radio" name="choice" value="thunder" />Thunder</label>`;

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
            return {damageRoll: `${damageDice}[${damageType}]`, flavor: optionName};
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
