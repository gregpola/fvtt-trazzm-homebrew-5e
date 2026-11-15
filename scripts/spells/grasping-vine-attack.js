/**
 *  Make a melee spell attack against a creature within 30 feet of the vine. On a hit, the target takes 4d8 Bludgeoning
 *  damage and is pulled up to 30 feet toward the vine; if the target is Huge or smaller, it has the &Reference[Grappled]
 *  condition (escape DC equal to your spell save DC).
 */
const optionName = "Vine Attack";
const version = "14.5.0";

try {
    const targetToken = workflow.hitTargets?.first();
    if (args[0].macroPass === "postActiveEffects" && targetToken) {
        await HomebrewMacros.pullTargetTowardsSelf(token, targetToken, 30, optionName);

        if (HomebrewHelpers.isHugeOrSmaller(targetToken)) {
            await targetToken.actor.toggleStatusEffect('prone', {active: true});
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
