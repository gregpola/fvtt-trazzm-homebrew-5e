/*
    When you cast a spell targeting yourself, you can also affect your Primal Companion beast with the spell if the
    beast is within 30 feet of you.
*/
const optionName = "Share Spells";
const version = "13.5.0";
const effectName = "Summon: Primal Companion";

try {
    if (args[0].tag === "OnUse" && args[0].macroPass === "prePreambleComplete" && rolledItem.type === "spell") {
        // check the spell targeting and type to make sure it is eligible
        let isEligible = workflow.targets.has(token);

        // get the companion
        if (isEligible) {
            const beastCompanionToken = await HomebrewHelpers.findBeastCompanion(actor);
            if (beastCompanionToken && !workflow.targets.has(beastCompanionToken)) {
                // check distance
                if (MidiQOL.computeDistance(token, beastCompanionToken) <= 30) {
                    // confirm share
                    const useFeature = await foundry.applications.api.DialogV2.confirm({
                        window: {
                            title: `${optionName}`,
                        },
                        content: `<p>Do you want to share ${rolledItem.name} with your companion?</p>`,
                        rejectClose: false,
                        modal: true
                    });

                    if (useFeature) {
                        workflow.targets.add(beastCompanionToken);
                        workflow.hitTargets.add(beastCompanionToken);
                        await HomebrewHelpers.updateTargets(workflow.targets);
                    }
                }
            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
