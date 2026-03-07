/*
    Once on each of your turns when you hit a creature with an attack roll using a weapon, you can cause the target to
    take an extra 1d8 Necrotic or Radiant damage (your choice).

    @scale.cleric.divine-strike
*/
const version = "13.5.1";
const optionName = "Blessed Strikes: Divine Strike";
const timeFlag = "blessed-strikes-time";

try {
    if (args[0].macroPass === "DamageBonus") {
        if (!workflow.hitTargets.size) return {};
        if (rolledItem.type !== "weapon") return {};

        // Check for availability i.e. once per actors turn
        if (!game.combat || !HomebrewHelpers.isOwnTurn(token) || !HomebrewHelpers.isAvailableThisTurn(actor, timeFlag)) {
            console.log(`${optionName}: is not available for this action`);
            return {};
        }

        let damageDice = actor.system.scale.cleric['divine-strike'].die;

        let content = `
            <p>Apply ${optionName} to this attack?</p>
            <sub>Once per turn, when you damage a target with a weapon, you can add ${damageDice} radiant or necrotic damage.</sub>
            <p>Select the damage type:</p>
            <label><input type="radio" name="choice" value="radiant" checked> Radiant</label>
            <label><input type="radio" name="choice" value="necrotic"> Necrotic</label>`;

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
