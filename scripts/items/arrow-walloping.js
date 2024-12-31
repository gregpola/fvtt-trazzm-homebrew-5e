/*
    This ammunition packs a wallop. A creature hit by the arrow must succeed on a DC 10 Strength saving throw or be knocked Prone.
*/
const version = "12.3.0";
const optionName = "Walloping Arrrow";

try {
    if (args[0].macroPass === "postActiveEffects") {
        for (let targetToken of workflow.failedSaves) {
            await HomebrewEffects.applyProneEffect(targetToken.actor, macroItem );
            ChatMessage.create({
                content: `${actor.name} knocks ${targetToken.name} pone`,
                speaker: ChatMessage.getSpeaker({actor: actor})
            });
        }
    }
}
catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
