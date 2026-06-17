/*
    Alchemical Eruption. When you cast an Artificer spell that deals Acid, Fire, or Poison damage to a target, you can
    also deal 2d8 Force damage to that target. You can use this benefit only once on each of your turns.
*/
const version = "14.5.0";
const optionName = "Chemical Mastery";
const eligibleDamageTypes = ['acid', 'fire', 'poison'];
const timeFlag = "chemical-mastery-time";

try {
    if (args[0].macroPass === "DamageBonus" && (workflow.hitTargets.size > 0)) {
        // make sure the trigger is a spell
        if (rolledItem.type === "spell" && rolledItem.system.sourceClass === "artificer") {
            // check the damage type
            if (eligibleDamageTypes.includes(workflow.defaultDamageType)) {
                if (HomebrewHelpers.perTurnCheck(actor, timeFlag, 'tokenTurn', true, token.id)) {
                    let content = '<p><label>Select the target to attack with Cleave or close the dialog to pass:</label></p>' +
                        `<p><select name="targets">${target_content}</select></p>`;

                    // ask if they want to apply the damage to this attack
                    const result = await foundry.applications.api.DialogV2.wait({
                        window: { title: `${optionName}` },
                        form: { closeOnSubmit: true },
                        content: `<p><label>Apply ${optionName} (extra 2d8 force damage) to this damage?</label></p>`,
                        buttons: [
                            {
                                action: "Yes",
                                default: true,
                                label: "Yes",
                                callback: () => "Yes"
                            },
                            {
                                action: "No",
                                default: false,
                                label: "No",
                                callback: () => "No"
                            },
                        ],
                        rejectClose: false,
                        modal: true
                    });

                    if (result === "Yes") {
                        await HomebrewHelpers.setTurnCheck(workflow.actor, timeFlag);
                        return new CONFIG.Dice.DamageRoll(`2d8[${optionName}]`, {}, {type: 'force', properties: [...rolledItem.system.properties]});
                    }
                }
            }
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
