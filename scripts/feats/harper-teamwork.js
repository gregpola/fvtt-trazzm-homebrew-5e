/*
    Inspiring Willpower.
    If you succeed on a saving throw to end the Frightened or Paralyzed condition on yourself, you can choose one ally
    you can see within 30 feet of yourself that has the same condition. That condition immediately ends for that ally.
*/
const optionName = "Inspiring Willpower - Frightened";
const version = "13.5.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        for (let targetToken of workflow.targets) {
            if (targetToken.actor.statuses.has("frightened")) {
                await targetToken.actor.toggleStatusEffect('frightened', {active: false});

                let chatContent = `<div class="midi-qol-nobox"><div class="midi-qol-flex-container"><div>Removes frightened condition from: </div><div class="midi-qol-target-npc midi-qol-target-name" id="${targetToken.id}"> ${targetToken.actor.name}</div><div><img src="${targetToken.document.texture.src}" width="30" height="30" style="border:0px" /></div></div></div>`;
                ChatMessage.create({
                    content: chatContent,
                    speaker: ChatMessage.getSpeaker({actor: actor})
                });

            }
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
