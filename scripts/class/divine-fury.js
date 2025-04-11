/*
	You can channel divine power into your strikes. On each of your turns while your Rage is active, the first creature
	you hit with a weapon or an Unarmed Strike takes extra damage equal to 1d6 plus half your Barbarian level (round down).
	The extra damage is Necrotic or Radiant; you choose the type each time you deal the damage.
*/
const version = "12.4.0";
const optionName = "Divine Fury";
const rageEffectName = "Rage";
const timeFlag = "last-divine-fury";

try {
    if (args[0].macroPass === "DamageBonus") {
        // make sure the actor is raging
        if (!HomebrewHelpers.findEffect(actor, rageEffectName)) {
            console.log(`${optionName}: not raging`);
            return {};
        }

        // make sure it's an applicable attack
        // TODO check unarmed strike
        if (!["mwak","rwak"].includes(workflow.activity.actionType)) return {};

        // Check for availability i.e. first hit on the actors turn
        if (HomebrewHelpers.isAvailableThisTurn(actor, timeFlag) && game.combat) {
            let content = `<div class="flexcol">
                <div class="flexrow"><p>Select the damage type for this attack:</p></div>
                <label style="margin-bottom: 10px;"><input style="right: 10px;" type="radio" name="choice" value="radiant" checked />Radiant</label>
                <label style="margin-bottom: 10px;"><input style="right: 10px;" type="radio" name="choice" value="necrotic" checked />Necrotic</label>
            </div>`;

            let damageType = await foundry.applications.api.DialogV2.prompt({
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
                const barbarianLevel = actor.getRollData().classes.barbarian?.levels ?? 0;
                const bonus = Math.ceil(barbarianLevel / 2);

                return new game.system.dice.DamageRoll(`1d6 + ${bonus}`, {}, {
                    isCritical: workflow.isCritical,
                    properties: ["mgc"],
                    type: `${damageType}`,
                    flavor: optionName
                });

            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
