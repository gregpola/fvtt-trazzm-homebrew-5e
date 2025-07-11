/*
    You can use your Channel Divinity to wield the power of the storm with unchecked ferocity.

    When you roll lightning or thunder damage, you can use your Channel Divinity to deal maximum damage, instead of rolling.
*/
const optionName = "Destructive Wrath";
const version = "12.4.1";
const validTypes = ['lightning', 'thunder'];

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postDamageRoll") {
        // make sure the actor has item uses available
        let channelDivinity = actor.items.find(i => i.name === 'Channel Divinity');
        if (channelDivinity) {
            if (channelDivinity.system.uses.spent < channelDivinity.system.uses.max) {
                // look for the eligible damage types
                const isEligibleType = workflow.damageRolls.filter(i => validTypes.includes(i.options.type));
                if (isEligibleType && (isEligibleType.length > 0)) {
                    const proceed = await foundry.applications.api.DialogV2.confirm({
                        window: {
                            title: `${optionName}`,
                        },
                        content: `<p>Apply ${optionName} to this attack?</p><sub>Costs 1 Channel Divinity use and maximizes lightning and thunder damage</sub>`,
                        rejectClose: false,
                        modal: true
                    });

                    if (proceed) {
                        await Promise.all(workflow.damageRolls.map(async (damageRoll, i, arr) => {
                            if (validTypes.includes(damageRoll.options.type)) arr[i] = await damageRoll.reroll({maximize: true});
                        }));
                        workflow.setDamageRolls(workflow.damageRolls);

                        const newValue = channelDivinity.system.uses.spent + 1;
                        await channelDivinity.update({"system.uses.spent": newValue});
                    }
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
