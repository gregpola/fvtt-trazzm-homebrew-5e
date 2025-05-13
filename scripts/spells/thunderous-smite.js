/*
    Your strike rings with thunder that is audible within 300 feet of you, and the target takes an extra 2d6 Thunder
    damage from the attack. Additionally, if the target is a creature, it must succeed on a Strength saving throw or be
    pushed 10 feet away from you and have the Prone condition.

    Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 1.
*/
const version = "12.4.1";
const optionName = "Thunderous Smite";

try {
    if (args[0].macroPass === "DamageBonus") {
        let targetToken = workflow.hitTargets.first();
        const spellLevel = actor.flags["fvtt-trazzm-homebrew-5e"].ThunderousSmite.level ?? 1;
        const diceCount = 1 + spellLevel;

        const saveDC = actor.system.attributes.spelldc;
        const saveFlavor = `${CONFIG.DND5E.abilities["str"].label} DC${saveDC} ${optionName}`;
        let saveRoll = await targetToken.actor.rollAbilitySave("str", {flavor: saveFlavor, damageType: "thunder"});
        if (saveRoll.total < saveDC) {
            await HomebrewMacros.pushTarget(token, targetToken, 2);
            await targetToken.actor.toggleStatusEffect('prone', {active: true});
        }

        return new game.system.dice.DamageRoll(`${diceCount}d6`, {}, {
            isCritical: workflow.isCritical,
            properties: ["mgc"],
            type: "thunder",
            flavor: optionName
        });
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}
