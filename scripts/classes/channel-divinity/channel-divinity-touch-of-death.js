/*
    When the cleric hits a creature with a melee attack, the cleric can use Channel Divinity to deal extra necrotic
    damage to the target. The damage equals 5 + twice his or her cleric level.
*/
const version = "12.3.0";
const optionName = "Channel Divinity: Touch of Death";

try {
    if (args[0].macroPass === "DamageBonus") {
        // check the remaining uses // amount
        const usesItem = actor.items.find(i => i.id === macroItem.system.consume.target);
        if (usesItem) {
            let usesLeft = usesItem.system.uses.value;
            if (usesLeft > 0) {
                const targetToken = workflow.hitTargets.first();

                if (targetToken && ["mwak", "msak"].includes(workflow.item.system.actionType)) {
                    // ask if they want to use the feature
                    let content = `<div class="flexcol">
                            <div class="flexrow"><p>Do you want to use ${macroItem.name} to apply extra necrotic damage?</p></div>
                            <div class="flexrow" style="margin-bottom: 10px;"><sub>(${usesLeft} uses remaining)</sub></div>
                        </div>`;

                    const proceed = await foundry.applications.api.DialogV2.confirm({
                        window: {
                            title: `${optionName}`,
                        },
                        content: content,
                        rejectClose: false,
                        modal: true
                    });

                    if (proceed) {
                        const damageRoll = macroItem.system.damage.parts[0][0];
                        await usesItem.update({"system.uses.value": usesLeft - 1});
                        return {damageRoll: `${damageRoll}[necrotic]`, flavor: optionName};

                    }
                }
            }
        }
        else {
            console.error(`${optionName}: ${version}`, 'Unable to locate the consumption item');
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
