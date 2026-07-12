/*
    When you hit a creature with a weapon, you can gain Temporary Hit Points equal to the total number rolled on the
    weapon’s damage dice. Once you use this benefit, you can’t use it again until you roll Initiative or finish a Short or Long Rest.
*/
const optionName = "Buffering Strike";
const version = "14.5.0";

try {
    const hitTarget = workflow.hitTargets.first();
    if (args[0].tag === "OnUse" && args[0].macroPass === "postDamageRoll" && hitTarget) {
        if (rolledItem.type === 'weapon' && rolledActivity.type === 'attack') {
            // check usage
            const activityRef = macroItem.system.activities.getName(optionName);
            if (activityRef) {
                const maxValue = activityRef.uses.max;
                const spentValue = activityRef.uses.spent;

                if (spentValue < maxValue) {
                    // ask if they want to use the option
                    const proceed = await foundry.applications.api.DialogV2.prompt({
                        content: `<p>Apply ${optionName} from this attack?</p>`,
                        rejectClose: false,
                        ok: {
                            callback: (event, button, dialog) => {
                                return true;
                            }
                        },
                        window: {
                            title: `${optionName}`,
                        },
                        position: {
                            width: 400
                        }
                    });

                    if (proceed) {
                        // update the healing of Buffering Strike
                        let damageDiceTotal = 0;
                        for (let die of workflow.damageRoll.dice) {
                            damageDiceTotal += die.total;
                        }
                        await activityRef.update({"healing.custom.formula" : `${damageDiceTotal}`});
                        await activityRef.use();
                    }
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
