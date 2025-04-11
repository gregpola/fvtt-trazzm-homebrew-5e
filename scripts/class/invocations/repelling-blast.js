/*
    Choose one of your known Warlock cantrips that requires an attack roll. When you hit a Large or smaller creature
    with that cantrip, you can push the creature up to 10 feet straight away from you.
*/
const version = "12.4.0";
const optionName = "Repelling Blast";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "postActiveEffects") {
        if (rolledItem.type === "spell" && rolledItem.name.endsWith(", Repelling Blast")) {
            let targetToken = workflow.hitTargets.first();
            if (targetToken) {
                const tsize = targetToken.actor.system.traits.size;
                if (["tiny", "sm", "med", "lg"].includes(tsize)) {

                    const proceed = await foundry.applications.api.DialogV2.confirm({
                        window: {
                            title: `Eldritch Invocation: ${optionName}`,
                        },
                        content: `<p>Use ${optionName} to push ${targetToken.name} 10 feet?</p>`,
                        rejectClose: false,
                        modal: true
                    });

                    if (proceed) {
                        await HomebrewMacros.pushTarget(token, targetToken, 2);
                    }
                }
            }
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
