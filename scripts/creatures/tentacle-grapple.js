/*
    Melee Weapon Attack: +5 to hit, reach 10 ft., one target. Hit: 10 (2d6 + 3) bludgeoning damage, and the target is
    Grappled (escape DC 13). Until this grapple ends, the target is Restrained and the tentacle can't be used to attack
    a different target. The arboreal grappler has two tentacles, each of which can grapple one target. When the arboreal
    grappler moves, it can drag a Medium or smaller target it is grappling at full speed.
*/
const version = "11.0";
const optionName = "Tentacle Grapple";

try {
    let targetToken = workflow?.hitTargets?.first();
    if ((args[0].macroPass === "postActiveEffects") && targetToken) {
        let grappled = await HomebrewMacros.applyGrappled(token, targetToken, 13, null, null);
        if (grappled) {
            ChatMessage.create({
                content: `The vines entwine ${targetToken.name}`,
                speaker: ChatMessage.getSpeaker({ actor: actor })});
        }
    }
} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
