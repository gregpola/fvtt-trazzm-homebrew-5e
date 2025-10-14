/*
    You can weave magic around yourself for protection. When you cast an Abjuration spell with a spell slot, you can
    simultaneously use a strand of the spell’s magic to create a magical ward on yourself that lasts until you finish a
    Long Rest. The ward has a Hit Point maximum equal to twice your Wizard level plus your Intelligence modifier.
*/
const optionName = "Arcane Ward";
const version = "13.5.0";
const _flagGroup = "fvtt-trazzm-homebrew-5e";
const _flagName = "arcane-ward-hp";

try {
    const wizardLevels = actor.getRollData().classes?.wizard?.levels;
    const intMod = actor.system.abilities.int.mod;
    const wardStrength = 2 * wizardLevels + intMod;
    await actor.setFlag(_flagGroup, _flagName, { max: wardStrength, current: wardStrength });

    ChatMessage.create({
        content: `${token.name}'s Arcane Ward has ${wardStrength} max hit points`,
        speaker: ChatMessage.getSpeaker({actor: actor})
    });

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
