/*
    While your Rage is active, you can cause a Large or smaller creature to have the prone condition when you hit it with a melee attack.
*/
const optionName = "Power of the Wilds - Ram";
const version = "13.5.0";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postAttackRoll") {
        for (let targetToken of workflow.hitTargets) {
            if (["mwak", "msak"].includes(rolledActivity.actionType)) {
                if (["tiny", "sm", "med", "lg"].includes(targetToken.actor.system.traits.size)) {
                    const proceed = await foundry.applications.api.DialogV2.confirm({
                        window: {
                            title: `${optionName}`,
                        },
                        content: `Do you want to knock ${targetToken.name} prone?`,
                        rejectClose: false,
                        modal: true
                    });

                    if (proceed) {
                        await targetToken.actor.toggleStatusEffect('prone', {active: true});
                    }
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
