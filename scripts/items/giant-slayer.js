/*
    When you hit a giant with it, the giant takes an extra 2d6 damage of the weapon's type and must succeed on a DC 15
    Strength saving throw or fall Prone. For the purpose of this weapon, "giant" refers to any creature with the giant
    type, including ettins and trolls.
*/
const version = "12.3.0";
const optionName = "Giant Slayer";
const saveDC = 15;

try {
    if (args[0].macroPass === "postActiveEffects") {
        for (let targetToken of workflow.hitTargets) {
            if (HomebrewHelpers.raceOrType(targetToken.actor).toLowerCase() === "giant") {
                const saveFlavor = `${CONFIG.DND5E.abilities["str"].label} DC${saveDC} ${optionName}`;
                let saveRoll = await targetToken.actor.rollAbilitySave("str", {flavor: saveFlavor, damageType: "prone"});
                if (saveRoll.total < saveDC) {
                    await HomebrewEffects.applyProneEffect(targetToken.actor, item);
                    ChatMessage.create({
                        content: `${actor.name} knocks ${targetToken.name} prone`,
                        speaker: ChatMessage.getSpeaker({actor: actor})
                    });
                }
            }
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
